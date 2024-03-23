import Stripe from "stripe" // importamos o stripe que instalamos
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";


const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
// configuramos o stripe passando sua chave de api 

const FRONTEND_URL = process.env.FRONTEND_URL as string;
// passamos a url do frontend para onde o stripe vai redirecionar o usuário após ele ter concluido o checkout

const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string
// pegamos nosso endpoint para acessar o webhook do stripe


const getMyOrder = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.userId }).populate("restaurant").populate("user")
        /*
            Procuramos nos documentos de Order pelo order (pedido) que tem o id do usuário no campo user
            então se o pedido tiver o id do usuario logado, nos obtemos esses pedidos

            populate vai nos trazer o user e o restaraurant junto com objeto "orders",
            nós referênciamos esses models "User" e "Restaurant" no nosso model de "Order"

            iremos retornar um objeto assim: 

            Order = { // criamos um tipo para o pedido
            _id: string; // teremos um id do pedido
            restaurant: Restaurant; // teremos um restaurante que foi feito o pedido
            user: User; // teremos o usuário que fez o pedido
            cartItems: { // teremos um carrinhos de items
                menuItemId: string;
                name: string;
                quantity: string;
            }[]; // esse [] indica que cartItems vai ser um array, que vai conter varios objetos com essas três propiedades
            deliveryDetails: {
                name: string;
                addressLine1: string;
                city: string;
                email: string;
            };
            totalAmount: number;
            status: OrderStatus;
            createdAt: string;
            restaurantId: string;
        }
        */
       res.json(orders);

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "something went wrong" })
    }
}

type CheckoutSessionRequest = { // criamos um tipo para nossa request
    cartItems: { // iremos receber o carrinho (cartItems)
        menuItemId: string;
        name: string;
        quantity: string;
    }[];
    // esse array "[]" significa que no body da request iremos receber um array, ou seja cartItems vai ser um array 
    
    deliveryDetails: { // informamos que também vamos receber os detalhes da entrega, que vai vim do formulario de usuario, antes do usuario ir para o chckout ele vai confirmar novamente esses deliveryDetails
        email: string;
        name: string;
        addressLine1: string;
        city: string;
    };

    restaurantId: string; // também teremos no body o restaurantId
}

const stripeWebHookHandler = async (req: Request, res: Response) => {
    
    let event; // incializamos uma variavel event sem atribuir nada a ela, porque irá acontecer varios eventos e sempre ela precisará ser alterada

    try {
        const sig = req.headers["stripe-signature"]; // pegamos do header a assinatura do stripe
        event = STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_ENDPOINT_SECRET as string)
        /*
            Oque está acontecendo aqui por trás das cenas é:
            stripe irá verificar se a solicitação veio do stripe usando nosso endpointSecret que definimos em .env
        */
        // construimos um evento do stripe passando nosso body e a "sig" (assinatura), depois nosso endpoint
    } catch (error: any) {  
        console.log(error)
        return res.status(400).send(`Webhook erro: ${error.message}` )
    }

    if (event.type === "checkout.session.completed") { // se o tipo do evento for "checkout.session.completed"
        const order = await Order.findById(event.data.object.metadata?.orderId)

        /*
            Lembrando que antes de chegar a essa função nos criamos um pedido (order), e criamos uma (session) onde tem o id do pedido e do restaurante
            na base de dados, Então procuramos se esse pedido existe na base de dados, pegando o id do pedido que foi criado na session
        */

            if(!order) {
                // se não existir pedido retornamos um erro
                return res.status(404).json({ message: "Order not found" })
            }

            order.totalAmount = event.data.object.amount_total
            // atualizamos nosso valor do pedido total para o total que veio do evento
            order.status="paid"
            // atualizamos o status do pedido para "paid" (pago)
            await order.save(); // por fim salvamos o pedido atualizado!
    }
    res.status(200).send() // retornamos apenas um status de ok

}

const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body
        // passamos nosso tipo da request "CheckoutSessionRequest" para "checkoutSessionRequest"
        // e pegamos o body

        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId)
        // buscamos o restaurante pelo id que recebemos na request

        if(!restaurant) { // se não encontrarmos o restaurant lançamos um erro
            throw new Error("Restaurant not Found")
        }

        const newOrder = new Order({ // criamos um pedido usando nosso model
            restaurant: restaurant, // passamos o restaurant que está sendo feito o pedido
            user: req.userId, // passamos o id do usuário que está fazendo o pedido
            status: "placed", // definimos status como inicialmente ao criar o pedido como "placed"
            deliveryDetails: checkoutSessionRequest.deliveryDetails, // passamos os detalhes do pedido
            cartItems: checkoutSessionRequest.cartItems, // passamos o carrinho de items
            createAt: new Date(), // passamos para createAt uma data, criamos a data com new Date()

        })

        const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems)
        // chamamos a nossa função "createLineItems" que cria um line Item para cada (cartItem) do carrinho, passamos também o array "menuItems" do restaurante

        const session = await createSession(lineItems, newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString())
        /*
            Passamos para nossa função de createSession, nosso lineItems, id do pedido (newOrder._id), o preço do delivery do restaurante (restaurant.deliveryPrice), passamos o id do restaurant (restaurant._id)
        */
        
        if(!session.url) {
            // se nos não tivermos nessa session uma url
            return res.status(500).json({ message: "Error creating stripe session" })
            // retornamos um erro, falando que deu erro ao criar uma seção stripe
        }

        await newOrder.save(); // salvamos o pedido na base de dados
        res.json({ url: session.url }) // retornamos a session url

    } catch (error: any) { // falamos que erro pode vir qualquer coisa (any)
        console.log(error)
        res.status(500).json({ message: error.raw.message }) // aqui retornamos a menssagem de erro error.raw.message
    }
}

// essa função e para criar a linha dos items que estão sendo pagos
const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: MenuItemType[]) => {
    /* 
        aqui vamos converter o cartItems array que obetemos em "checkoutSessionRequest"

            cartItems: {
                menuItemId: string;
                name: string;
                quantity: string;
            }[];

        converteremos essa estrutura de dados em line Item antes de enviar para o stripe
    */
    // 1. forEach cartItem, obter o objeto menuItem do restaurante (para obtermos o preço do item)
    // 2. forEach cartItem, converter isso para stripe line item
    // 3. retornar o array line item 
    
    const lineItems = checkoutSessionRequest.cartItems.map((cartItem)=>{
        // vamos converter aqui, então primeiro vamos obter o objeto do item (cartItem) do restaurant, para pegarmos o preço
        const menuItem = menuItems.find((item)=> item._id.toString() === cartItem.menuItemId.toString())
        /*
            Aqui estamos tentando encontrar o item (cartItem) que os id sejam iguais então,
            (item) - representa cada objeto sendo percorrido dentro de cartItems
            então nesse objeto temos a propiedade do _id, em cartItem que é oque recebemos da request, tem essa propiedade _id também

            então passamos o valor da propiedade _id para string, e verificamos se são iguais
        */
       if(!menuItem) { // se o item não existe, ou seja os _id não são iguais, lançamos um erro
            throw new Error(`Menu Item not Found: ${cartItem.menuItemId}`)
       }

       const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
        // aqui apenas criamos um objeto line Item, do Stripe, definindo seu tipo como 'Stripe.Checkout.SessionCreateParams.LineItem'
        price_data: { // aqui passamos essa configuração dos dados do preço
            currency: "usd", // informamos o tipo da moeda
            unit_amount: menuItem.price, // aqui passamos o preço do produto que buscamos na base de dados do restaurante
            product_data: { // depois passamos para essa propiedade os dados do produto
                name: menuItem.name, // passamos o nome do produto
            },
        },
        quantity: parseInt(cartItem.quantity) // depois passamos a quantidade desse produto, pegando do cartItem que recebemos da request, e fazemos um parse para um Int
       }

       /*
            Obs: porque não recebemos o preço do produto (cartItem) direto da request?
                por causa de segurança, Exemplo:
                    Qualquer um poderia fazer uma requisição para o checkout utilizando o postman, é alterar o preço do produto (cartItem)
       */


       return line_item; // retornamos esse line item
    });

    return lineItems;
};


const createSession = async (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, restaurantId: string) => {
    /*
        Nessa função recebemos um array lineItems de items do tipo: Stripe.Checkout.SessionCreateParams.LineItem
        Recebemos um orderId (id do pedido)
        Recebemos o preço do delivery
        Recebemos o restaurantId (id do restaurante)
    */

    const sessionData = await STRIPE.checkout.sessions.create({
        // aqui criamos os dados da session usamos( STRIPE.checkout.sessions.create) para criar
        line_items: lineItems, // passamos o nosso line_items
        shipping_options: [ // passamos alguma opções de envio para criação dessa session
            { // nesse objeto será o nosso preço do delivery
                shipping_rate_data: { // aqui informamos os dados passando para propiedade "shipping_rate_data"
                    display_name: "Delivery", // passamos o nome que vamos exibir
                    type: "fixed_amount", // o tipo desse valor
                    fixed_amount: { // e para o tipo que especificamos passamos o valor
                        amount: deliveryPrice, // passamos o preço do delivery aqui
                        currency: "usd" // e o tipo da moeda
                    }
                }
            }
        ],
        mode: "payment", // informamos o modo que ultilizaremos nessa seção (session)
        metadata: { // meta data e onde podemos adicionar alguma informação adicional, que nos queremos salvar denovo nesse payment
            orderId,
            restaurantId
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        // success_url é para onde redirecionamos o user após o pagamento for concluido
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancel=true`
        // se o usuário cancelar o pagamento redirecionamos ele de volta para página de detalhes do restaurante
    })
    return sessionData; // retornamos o nosso sessionData com a session criada
}


export default {
    getMyOrder,
    createCheckoutSession,
    stripeWebHookHandler,
}
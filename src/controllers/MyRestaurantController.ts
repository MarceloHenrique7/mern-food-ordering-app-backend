import { Request, Response } from "express"
import Restaurant from "../models/restaurant"
import cloudinary from 'cloudinary'
import mongoose from "mongoose"
import Order from "../models/order"


// função para obetermos os dados do restaurante
const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId }) // buscamos na base de dados pelo restaurante, usando o id do usuario, esse id do usuario e atribuido na hora da criação do restaurante, pegamos o id do usuario que esta criando o restaurante e atribuimos a um campo chamado "user" no "Restaurante"
        if (!restaurant) {
            return res.status(404).json({ message: "restaurant nor found" }) // caso não encontrarmos o restaurante, retornamos uma mensagem de erro dizendo que o restaurante nao foi encontrado
        }

        res.json(restaurant) // se o restaurante existir retornamos ele
    } catch (error) {
        // se der algum erro retornamos um status de 500 e exibimos o erro no console
        console.log("error", error)
        res.status(500).json({ message: "Error fetching restaurant"})
    }
}


// nossa logica de negocio é que o usuario so vai poder criar um restaurante por conta

const createMyRestaurant = async (req: Request, res: Response) => {
    
    try {
        const existingRestaurant = await Restaurant.findOne({ user: req.userId }) // procuramos por um restaurante que tenha o mesmo id que o id do usuario, ou seja como referenciamos o campo "user" no model de resturante, ao campo "userId" que e de um usuario, então passamos o id do usuario para verificar se existe algum restaurante
        if (existingRestaurant) { // se o restaurante existir faça esse if
            return res.status(409).json({ message: "User restaurant already exists" }) // retornamos um statusCode de 409 que significa duplicação e uma msg de error
        }
        
        const imageUrl = await uploadImage(req.file as Express.Multer.File) // chamamos a função que faz a logica para nos retorna uma URL acessivel do arquivo, passamos o req.file arquivo que e recebido na requisição e falamos que ele e do tipo Express.Multer.File

        const restaurant = new Restaurant(req.body) // criamos um restaurante com as informações do body
        restaurant.imageUrl = imageUrl // aqui atribuimos a url que quando criamos essa imagem, cloudinary eles também nos retorna uma url com a nossa imagem
        restaurant.user = new mongoose.Types.ObjectId(req.userId) // atribuimos ao campo user o campo userId que vem da request
        
        restaurant.lastUpdated = new Date(); // aqui criamos uma data para este campo antes de criar o restaurante

        await restaurant.save(); // aqui salvamos o restaurante no bancod e dados
        res.status(201).send(restaurant) // enviamos de volta o restaurant que vai ser usado no front end (seus dados)

    } catch (error) { // caso algo der errado retornamos status 500 e uma mensagem de erro
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }

}

const updateMyRestaurant = async (req: Request, res: Response) => {


    try {
        const restaurant = await Restaurant.findOne({
            user: req.userId // buscaremos esse restaurante na base de dados elo id do usuario, porque campo user de restaurant está vinculado com userId do usuario
        });

        if(!restaurant) {
            return res.status(404).json({ message: "restaurant not found" }) // caso não exista o restaurante enviamos uma msg de erro
        }

        // caso o restaurante existe, atualizamos ele campo por campo, baseados na requisição do body

        restaurant.restaurantName = req.body.restaurantName
        restaurant.city = req.body.city
        restaurant.country = req.body.country
        restaurant.deliveryPrice = req.body.deliveryPrice
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
        restaurant.cuisines = req.body.cuisines
        restaurant.menuItems = req.body.menuItems
        restaurant.lastUpdated = new Date(); // aqui criamos uma nova data porque estamos atualizando o restaurante

        if(req.file) { // então verificamos se mandamos algum arquivo na requisição
            const imageUrl = await uploadImage(req.file as Express.Multer.File) // chamamos a função que faz a logica para nos retorna uma URL acessivel do arquivo, passamos o req.file arquivo que e recebido na requisição e falamos que ele e do tipo Express.Multer.File
            restaurant.imageUrl = imageUrl // passamos a url da imagem para o campo da base de dados
        }

        await restaurant.save(); // por fim salvamos os novos dados do restaurant
        res.status(200).send(restaurant); // retornamos o object restaurant
    } catch (error) {
        console.log("error", error) // caso der erro damos um console.log do erro
        res.status(500).json({ message: "Something went wrong" }) // e retornamos uma mensagem dizendo que algo deu errado
    }
}


const updateOrderStatus = async (req: Request, res: Response) => {
    // função para atualizar o status do nosso pedido
    try {
        const { orderId } = req.params;
        // aqui pegamos o id que passamos como parâmetro
        const { status } = req.body;
        // pegamos o status que vamos atualizar no pedido que vai vim do body

        const order = await Order.findById(orderId)
        // procuramos na base de dados pelo order (pedido) usando id recebido como parâmetro

        if(!order) {
            // se o pedido não existir retornamos um erro
            return res.status(404).json({ message: "order not found" })
        }

        const restaurant = await Restaurant.findById(order.restaurant)
        // depois buscamos pelo restaurante ultilizando o id do restaurante, (order armazena o id do restaurante, então order.restaurante e um objectId)

        // o motivo pelo qual pegamos o restaurante, e para checar se o usuário logado é o dono desse restaurante
        if(restaurant?.user?._id.toString() !== req.userId) {
            // se o id do usuário que está vinculado a esse restaurante não for igual ao id do usuário logado
            return res.status(401).send() // retornamos um statusCode de "Unauthorized" porque ele não pode atualizar um pedido que o restaurante não e dele
        }   

        order.status = status // então por fim, atualizamos o status do pedido
        await order.save(); // salvamos o pedido atualizado

        res.status(200).json(order) // retornamos uma resposta de 200 (ok) e Retornamos também o pedido atualizado
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "unable to update order status" })
    }
}


//função que converte a imagem para binario, depois construimos uma sttring do tipo de dados URI, apos isso subimos esse URI para o cloudinary que nos retorna uma url para acessar essa imagem
const uploadImage = async (file: Express.Multer.File) => { // essa linha de código está simplesmente atribuindo o objeto file, que contém as informações sobre o arquivo enviado na requisição, para a variável image, garantindo que o TypeScript reconheça corretamente o tipo desse objeto como Express.Multer.File. Essa variável image pode então ser usada para acessar informações sobre o arquivo, como nome, tamanho
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64");// Buffer.from(image.buffer): Esta parte do código está criando um objeto do tipo Buffer a partir do buffer do arquivo que foi carregado na memória pelo Multer. O buffer é uma representação binária dos dados do arquivo. .toString("base64"): Em seguida, estamos convertendo esse buffer para uma string no formato base64. O formato base64 é uma forma de representar dados binários usando caracteres ASCII
    const dataURI = `data:${image.mimetype};base64,${base64Image}`; // Aqui, estamos construindo uma string que representa o arquivo no formato de Data URI. Ele começa com data:, seguido pelo tipo MIME do arquivo (image.mimetype neste caso) e ;base64,, indicando que os dados estão codificados em base64
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI) // aqui enviamos nosso arquivo dataURI para ser armazenada no cloudinary, e de resposta devemos obter uma URL da imagem
    return uploadResponse.url
}

// Nessa função pegamos todos pedidos que foram feitos ao nosso restaurant
const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId }) 
        // primeiro procuramos pelo restaurante com id do usuario logado

        if (!restaurant) { // se não encontramos o restaurante retornamos um status de not Found e uma msg de error
            return res.status(404).json({ message: "something went wrong" })
        }
        
        const orders = await Order.find({ restaurant: restaurant._id }).populate("restaurant").populate("user")
        
        /* 
            Agora pegamos os pedidos na base de dados Ordes pelo id do restaurante 
            orders nos retorna um array de pedidos

        então populate siginifica para ele nos retornar o "restaurant" e o "user" que estão relacionados
        a esse pedido, junto com o objeto do pedido
        */

        res.json(orders) // retornamos o array de orders
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "something went wrong" })
    }
}

export default {
    updateOrderStatus,
    getMyRestaurantOrders,
    createMyRestaurant,
    getMyRestaurant,
    updateMyRestaurant,
}
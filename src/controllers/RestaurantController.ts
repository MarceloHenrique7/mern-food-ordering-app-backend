import { Request, Response } from "express"
import Restaurant from "../models/restaurant";


const searchRestaurant = async (req: Request, res: Response) => {

    try {
        const city = req.params.city; // pegamos a cidade que e passado como parâmetro 

        const searchQuery = req.query.searchQuery as string || "";
        /* 
         Pegamos a query se ela existir, se não existir atribuimos
         string vazia a essa variavel, oque vai vim na query e a pesquisa
         que fazemos no componente de pesquisa.
         por exemplo:

            exemplo na url de como vem a query
            URL = http://localhost:9000/api/restaurant/search/London?searchQuery=Salada

            pesquisamos por: Salada, no campo de pesquisa 
            oque recebemos: searchQuery = Salada
        */
        const selectedCuisines = req.query.selectedCuisines as string || "" 
        /* 
            recebemos na query um selectedCuisines:

            selectedCuisines e um array que vamos receber do frontend no envio da request
            para essa controller.
        */
        const sortOption = req.query.sortOption as string || "lastUpdated" 
        /* 
            recebemos na query uma sortOption:

            sortOption e onde selecionamos a ordenação dos restaurante,
            por exemplo quero ordenar por restaurantes que tenham menor
            tempo de entrega, então se o usuario selecionar essa opção,
            Obtemos ela aqui em sortOption;

            especifica como queremos que os resultados sejam classificados
            
            se não recebermos sortOption, então colocamos como valor padrão
            "lastUpdated"
        */

       const page = parseInt(req.query.page as string) || 1;
        // Também pegamos da query a page, Que siginifica qual página estamos, transformamos essa query que é uma string em int
       

       let query: any = {  };

       /* 
        Apenas declaramos esse objeto vazio.

        uery: any significa que a variável query
        pode conter qualquer tipo de valor - seja um número,
        uma string, um objeto, uma função, etc
       */ 

       query["city"] = new RegExp(city, "i");
        /*
        Essa linha diz:
        criamos uma consulta e adicionamos na nossa (query) com nome do campo e valor:
        query: {
            "city": London
        } por exemplo.

        Essa RegExp nos criamos para ignorar Case
        exemplo: nosso restaurante e definido como "london",
        e o usuário digitou "London", então essa RegExp retornara true

       */
       const cityCheck = await Restaurant.countDocuments(query)
       /* 
        Esta linha retorna o número de restaurantes que correspondem à consulta.
        Neste caso, estamos verificando apenas o campo "city".

        Por exemplo, se um restaurante no documento tem o campo
        city: "London", esta consulta nos retornará o número de restaurantes
        que possuem "London" como valor no campo "city".
       */

       if (cityCheck === 0) { // se cityCheck for 0 significa que 0 restautantes batem com a consulta (query) que o usuario fez.
            return res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1,
                }
                /* 
                    então retornamos essas propiedades informando um array (data) vazio.
                    porque existem 0 restaurantes que batem com a query.

                    Também retornamos essas informações de pagination para o frontend
                */
            })
       }


       if(selectedCuisines) {
        // Exemplos que podem vim na URL de selectedCuisines: italian,burguers,chinese
        const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"));
        // Em seguida fazemos um map por esse array pegando cada item dele
        // Então criamos esse "cuisinesArray", transformamos "selectedCuisines" que vem nesse formato: italian,burguers,chinese em um array [italian, burgers, chinese]
        /*
            essa RegExp nos criamos para ignorar Case
            exemplo: em city, o usuario digitou Londres ao inves de londres com letra maiuscula
        */
        query["cuisines"] = { $all: cuisinesArray}
            /*
            O operador $all: nesse caso siginifica todos os items desse array

            Estamos buscando todos restaurantes onde o array "cuisines", tenha todos items
            recebido em "cuisinesArray" que nos recebemos na request. 

            então checamos por cada documento de restaurante, no seu array "cuisines",
            checamos se esse array tem todos os items de "cuisinesArray".

            
            */
       }

       if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i") // criamos uma variavel searchRegex e ela guarda uma RegExp, que é basicamente o valor que vem do "searchQuery", a RegExp e para ignorar Case
            query["$or"] = [ //query["$or"] = [...]: Estamos atribuindo à chave "$or" de query um array com duas condições.
                
                // cheque na base de dados para cada restaurante se o restaurantName bate com a searchRegex
                // ou se alguma cuisine dentro do array "cuisines" bate com a searchRegex

                { restaurantName: searchRegex },
                /* 
                    { restaurantName: searchRegex }: A primeira condição procura documentos onde
                    o campo restaurantName corresponde à expressão regular searchRegex,

                    Supondo que searchRegex coresponde a = london
                    procuramos nos Restaurantes nos seus documentos
                    onde o campo "restaurantName" é igual a searchRegex
                */
                { cuisines: { $in: [searchRegex] } }
                /*
                    { cuisines: { $in: [searchRegex] } }: A segunda condição
                    procura documentos onde o campo cuisines contenha pelo menos
                    um valor que corresponda à expressão regular searchRegex. Aqui,
                    estamos usando o operador $in para verificar se cuisines contém
                    pelo menos um dos valores especificados. Ou seja, estamos procurando
                    restaurantes cujas cozinhas correspondam ao termo de pesquisa,
                    independentemente do caso.
                */
            ]
            /*
                Juntando tudo isso, a consulta final busca documentos que correspondam a
                qualquer uma das condições especificadas no array "$or". Ou seja, ela retorna
                restaurantes cujos nomes ou cujas cozinhas correspondem ao termo de pesquisa,
                ignorando a distinção entre maiúsculas e minúsculas.
            */
       }

       const pageSize = 10; // definimos o tamanho de resultados maximo que aparecera por página

       const skip = (page - 1) * pageSize; // serve para dizer em qual página dos resultados estamos

       /* 
       Por exemplo, vamos supor que estamos na página 3 e queremos mostrar 10 resultados por página (pageSize = 10):

        page = 3
        pageSize = 10
        Então, skip será calculado como:

        skip = (3 - 1) * 10
            = 2 * 10
            = 20

        Isso significa que devemos "pular" os primeiros 20 resultados antes de começar a exibir os resultados da página 3.
        Este cálculo é útil para implementar a funcionalidade de paginação em uma aplicação, permitindo que os usuários
        naveguem pelos resultados em blocos de tamanho definido.
       */

       const restaurants = await Restaurant.find(query)
       .sort({ [sortOption]: 1 })
       .skip(skip)
       .limit(pageSize)
       .lean();
       /* 
       Estamos procurando pelos restaurantes na base de dados que correspondem com a nossa (query)
       
       (sort) estamos ordenando os resultados com base em uma opção de classificação especificada.
       A variável sortOption é usada como chave dinâmica para definir a opção de classificação.
       O valor 1 indica que estamos ordenando em ordem crescente. Se fosse -1, seria em ordem decrescente.

       skip(skip): Este método instrui o MongoDB a ignorar um número específico de documentos antes de retornar
       os resultados. O valor de skip calculado anteriormente é usado aqui para determinar quantos documentos
       devem ser ignorados.

       limit(pageSize): Este método limita o número de documentos retornados pela consulta ao número especificado
    
       lean(): Este método converte os documentos retornados em objetos JavaScript simples (plain JavaScript objects),
       em vez de documentos Mongoose. Isso economiza recursos de memória, pois evita a sobrecarga de criar instâncias
       completas de modelos Mongoose.

       */


       const total = await Restaurant.countDocuments(query)
       // contamos o total de resultados encontrados que batem com as nossas consultas criadas (query)

       const response = { // criamos um objeto de resposta com os dados.
            data: restaurants, // pegamos os documentos (os restaurantes) que foram encontrado e passamos todos esses resturantes para data que é um array com os restaurants
            pagination: { // também retornamos a paginação para indicarmos ao usuario;
                total, // o total de resultados encontrados
                page, // a pagina dos resultados que ele está
                pages: Math.ceil(total / pageSize), 
                // e também determinamos o numero de páginas necessarias para exibir todos resultados.
                /*
                    Essa conta funciona assim:
                        Math.ceil(), que arredonda para cima qualquer número fracionário resultante do cálculo (total / pageSize).
                        
                    Por exemplo, se tivermos 25 documentos no total e estamos exibindo 10 documentos por página, o cálculo de pages seria:
                        pages = Math.ceil(25 / 10)
                              = Math.ceil(2.5) resultado dos parênteses
                              = 3 depois 2.5 seria arredondado para cima

                    Então teriamos que seriam necessario 3 páginas para exibir 25 documentos
                */
            }
       }

       res.json(response); // finalmente retornamos o resultado de toda pesquisa para o frontend exibir ao user
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "something went wrong" })
    }

};


export default {
    searchRestaurant
}
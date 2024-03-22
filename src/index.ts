import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config"
import mongoose from 'mongoose';
import myUserRoute from './routes/MyUserRoute'
import myRestaurantRoute from './routes/MyRestaurantRoute'
import RestaurantRoute from './routes/RestaurantRoute'
import { v2 as cloudinary } from 'cloudinary'
import orderRoute from './routes/OrderRoute'

mongoose
.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(()=> console.log("Connect to database"))

cloudinary.config({ // configurando o cloudinary que e onde vamos armazenar as imagens que vamos receber do form do restaurante
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express();

app.use(cors())


app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }))
/*
    app.use(): Este método é usado para adicionar middleware ao pipeline de solicitação do Express.

    "/api/order/checkout/webhook": Define o caminho da URL para o qual esse middleware será aplicado. Isso significa que esse middleware será executado apenas para solicitações que correspondam a este caminho.

    express.raw({ type: "/*" }): Este é o middleware em si. express.raw() é usado para tratar o corpo da solicitação como dados brutos, sem interpretá-los como JSON, texto, etc. O objeto { type: "/*" }
    define o tipo de conteúdo aceito como qualquer tipo (), o que significa que o middleware irá lidar com qualquer tipo de conteúdo.
*/
app.use(express.json())

app.get("/health", async (req: Request, res: Response) => { // essa rota servira para checar se o server foi iniciado com sucesso
    res.send({message: "health Ok!"}) // no deployment ira aparecer essa mensagem de ajuda para saber se o server ta ok
})

// /api/my/user ou /api/my/restaurant essas linha serão executada toda vez que for chamada essas rota
app.use("/api/my/user", myUserRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo MyUserRoute
app.use("/api/my/restaurant", myRestaurantRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo MyRestaurantRoute
app.use("/api/restaurant", RestaurantRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo RestaurantRoute
app.use("/api/order", orderRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo orderRoute

app.listen(7000, () => {
    console.log("server started on localhost:7000")
})
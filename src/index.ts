import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config"
import mongoose from 'mongoose';
import myUserRoute from './routes/MyUserRoute'
import myRestaurantRoute from './routes/MyRestaurantRoute'
import RestaurantRoute from './routes/RestaurantRoute'
import { v2 as cloudinary } from 'cloudinary'

mongoose
.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(()=> console.log("Connect to database"))

cloudinary.config({ // configurando o cloudinary que e onde vamos armazenar as imagens que vamos receber do form do restaurante
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express();

app.use(express.json())
app.use(cors())


app.get("/health", async (req: Request, res: Response) => { // essa rota servira para checar se o server foi iniciado com sucesso
    res.send({message: "health Ok!"}) // no deployment ira aparecer essa mensagem de ajuda para saber se o server ta ok
})

// /api/my/user ou /api/my/restaurant essas linha serão executada toda vez que for chamada essas rota
app.use("/api/my/user", myUserRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo MyUserRoute
app.use("/api/my/restaurant", myRestaurantRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo MyRestaurantRoute
app.use("/api/restaurant", RestaurantRoute) // dizemos que para essa rota sempre usaremos as rotas definida no arquivo RestaurantRoute

app.listen(7000, () => {
    console.log("server started on localhost:7000")
})
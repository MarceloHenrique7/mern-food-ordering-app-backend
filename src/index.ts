import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config"
import mongoose from 'mongoose';
import myUserRoute from './routes/MyUserRoute'

mongoose
.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(()=> console.log("Connect to database"))

const app = express();

app.use(express.json())
app.use(cors())


app.get("/health", async (req: Request, res: Response) => { // essa rota servira para checar se o server foi iniciado com sucesso
    res.send({message: "health Ok!"}) // no deployment ira aparecer essa mensagem de ajuda para saber se o server ta ok
})

// /api/my/user essa linha sera executada toda vez que for chamada essa rota
app.use("/api/my/user", myUserRoute) // ou seja em routes.ts todas rotas podem ser chamada com essa rota

app.listen(7000, () => {
    console.log("server started on localhost:7000")
})
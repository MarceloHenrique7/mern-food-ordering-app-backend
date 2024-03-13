import { Request, Response } from "express";
import User from "../models/user";

const getCurrentUser = async (req: Request, res: Response) => { // criamos uma função para buscar pelo usuario na base de dados
    try {
        const currentUser = await User.findOne({ _id: req.userId }) // aqui procuramos por Id
        if(!currentUser) {
            return res.status(404).json({ message: "User not found" }) // se o currentuser não existir nos retornamos 404, e uma mensagem de erro, dizendo que o user não foi encontrado
        }

        res.json(currentUser) // se o user foi encontrado retornamos o currentUser (usuario)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Something went wrong"}) // se der erro lançamos de volta um erro
    }
}

const createCurrentUser = async (req: Request, res:Response) => {
    // 1. checar se o user existe
    // 2. criar o user se não existir
    // 3. retornar o user object para o frontend ou para a chamada do client

    try {
        const { auth0Id } = req.body;
        const existingUser = await User.findOne({ auth0Id })


        if(existingUser) {
            return res.status(200).send()
        }

        const newUser = new User(req.body)
        await newUser.save();

        res.status(201).json(newUser.toObject())
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Error creating new user"})
    }
}

const updateCurrentUser = async (req: Request, res: Response) => { // controller que atualiza o usuario atual
    try {
        const { name, addressLine1, country, city } = req.body; // desestrutura os campos do req body
        const user = await User.findById(req.userId) // busca usuario pelo id

        if(!user) {
            return res.status(404).json({ message: "User not found" }) // se user nao existir retornamos O Codigo 401 
        }

        // ja que o user vem como um objeto usamos o '.' para atribuir as novas propiedades
        user.name = name 
        user.addressLine1 = addressLine1
        user.city = city
        user.country = country

        await user.save() // depois da tribuição salvamos no banco

        res.send(user) // retornamos o user atualizado
    } catch (error) { // caso dê erro retornamos o erro
        console.log(error)
        res.status(500).json({message: "Error updating user"})
    }
}

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
};
import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from 'jsonwebtoken'
import User from "../models/user";
import dotenv from 'dotenv'

dotenv.config()

declare global { // declare global, porque queremos que esse tipo que estamos criando seja acessivel em qualquer lugar do projeto
  namespace Express { // Representa que estamos criando uma referencia para Express
    interface Request { // Aqui estamos estendendo a interface Request do Express
      userId: string;
      auth0Id: string;
    }
  }
}


// Configurando para validar o token, sempre adicionamos a função de verificação JWT como middleware para nosso Routes, isso ira verificar o Authorization que contem o bearer Token
export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});

export const jwtParse = async (req: Request, res: Response, next: NextFunction) => {

  // função para fazer o parse o tokenJWT, assim tambem teremos acesso ao id do usuario que vai servir para função de update

  const { authorization } = req.headers;


  if(!authorization || !authorization.startsWith("Bearer")) { // se não existir authorization ou se existir authorization mas não começar com "Bearer" o valor desse authorization então execute esse if
    return res.status(401).json({ message: "Incorrect Token" }); // é uma forma conveniente de enviar uma resposta HTTP com apenas o código de status
  } 

  const token = authorization.split(' ')[1]; // o token vem assim "Bearer Token" e dai fazemos um split e pegamos apenas o token

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload // fazemos o decoded do token , nesse decoded contem Auth0Id so user (id)
    const auth0Id = decoded.sub // sub e a propiedade que armazena esse id

    console.log(decoded)
    console.log(auth0Id)

    const user = await User.findOne({ auth0Id: auth0Id }) // apenas buscando no banco de dados pelo usuario
    
    console.log(user)

    if(!user) { // se o usuario não existir na base de dados
      return res.status(404).json({ message: "user not found" })
    }

    req.auth0Id = auth0Id as string; // esse e o id do auth0 do serviço de login que fizemos no frontend
    req.userId = user._id.toString() // esse e o id do propio banco de dados que cria automaticamente, do propio mondoDb

    next() // chamamos a proxima função ou middleware para ser executada

  } catch (error) {
    return res.status(401).json({ message: "Something went wrong" })
  }

}
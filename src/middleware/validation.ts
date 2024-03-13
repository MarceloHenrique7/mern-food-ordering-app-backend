import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

const handleValidationsErrors = async (req: Request, res: Response, next: NextFunction) => { // função para validar o req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) { // verifica se os erros não estão vazios
        res.status(400).json({ errors: errors.array() }) // retornamos um array com os erros
    }
    next(); // se não tiver errors executamos a prox. função
}

export const validateMyUserRequest = [

    body("name").isString().notEmpty().withMessage("Name must be a string"), // withMessage significa que se o campo não for uma string ou se o campo for vazio a mensagem será exibida
    body("addressLine1").isString().notEmpty().withMessage("AddressLine1 must be a string"),
    body("city").isString().notEmpty().withMessage("city must be a string"),
    body("country").isString().notEmpty().withMessage("city must be a string"),
    handleValidationsErrors, // chamamos a função para que ela faça a validação encima de todos esses body

]
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
export const validateMyRestaurantRequest = [

    body("restaurantName").notEmpty().withMessage("Restaurant Name is required"), // withMessage significa que se o campo não for uma string ou se o campo for vazio a mensagem será exibida
    body("city").notEmpty().withMessage("city is required"),
    body("country").notEmpty().withMessage("country s required"),
    body("deliveryPrice").isFloat({ min: 0 }).withMessage("Delivery Price must be a positive number"), // { min: 0 } basicamente pedimos que isso não seja um numero negativo 
    body("estimatedDeliveryTime").isInt({ min: 0 }).withMessage("estimated delivery time must be a positive integer"), // { min: 0 } basicamente pedimos que isso não seja um numero negativo 
    body("cuisines").isArray().withMessage("Cuisines must be an array").not().isEmpty().withMessage("Cuisines array cannot be empty"), // .not().isEmpty() aqui checamos se não e um array vazio

    // aqui o MenuItems e um Array então estamos passando por cada items do array e fazendo essa verificação
    body("menuItems").isArray().withMessage("Menu Items must be an array"), // primeiro no array todo verificamos se ele e um array se não for damos a mensagem de volta

    // para cada menu items no array de menu items
    body("menuItems.*.name").notEmpty().withMessage("Menu Item name is required"), // aqui no meu array menuItems, para cada items dentro dele e para a propiedade .name dentro do item, verificamos se o nome não e vazio
    body("menuItems.*.price").isFloat({ min: 0 }).withMessage("Menu Item price is required and must be a positive number"), // aqui no meu array menuItems, para cada items dentro dele e para a propiedade .price dentro do item, verificamos se o price e um float e é um numero inteiro
    

    handleValidationsErrors, // chamamos a função para que ela faça a validação encima de todos esses body

]
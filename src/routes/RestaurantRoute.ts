import express from "express";
import RestaurantController from "../controllers/RestaurantController";
import { param } from "express-validator";

const router = express.Router();


// nessa rota vamos receber uma cidade como parâmetro da url
// exmplo: /api/restaurant/search/londres
router.get(
    "/search/:city", 
    param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parament must be a valid string"),
    RestaurantController.searchRestaurant
);
// adicionamos uma validação para o argumento recebido como parâmetro
// esse parâmetro tem que ser uma string, trim() eliminamos os espaços em branco do inicio e fim da string
// notEmpty() não pode ser vazio o parâmetro
// se essa validação não passar retornamos "City parament must be a valid string"

// após isso chamamos nossa controller de busca (Search)
export default router
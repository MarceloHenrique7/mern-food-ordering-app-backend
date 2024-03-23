// aqui definiremos a rota do pedido, a rota para quando um usuário finalizar o checkout

import express from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import OrderController from '../controllers/OrderController';

const router = express.Router();

router.get("/", jwtCheck, jwtParse, OrderController.getMyOrder)
// rota para buscar pelo pedido


// url para criarmos uma sessão de checkout
router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, OrderController.createCheckoutSession)
// para isso o usuario tem que estar logado

router.post("/checkout/webhook", OrderController.stripeWebHookHandler)
// rota para acessar nosso webhook do stripe
export default router
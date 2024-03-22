// aqui definiremos a rota do pedido, a rota para quando um usuário finalizar o checkout

import express from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import OrderController from '../controllers/OrderController';

const router = express.Router();

// url para criarmos uma sessão de checkout
router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, OrderController.createCheckoutSession)
// para isso o usuario tem que estar logado

router.post("/checkout/webhook", OrderController.stripeWebHookHandler)

export default router
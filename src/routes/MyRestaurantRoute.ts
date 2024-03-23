import express from 'express';
import multer from 'multer'; // importamos o multer que ele vai servir para lidarmos com uploads de arquivos
import MyRestaurantController from '../controllers/MyRestaurantController';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateMyRestaurantRequest } from '../middleware/validation';


const router = express.Router();

const storage = multer.memoryStorage(); // aqui estamos definindo um objeto de armazenamento de memória para o multer, isso significa que os arquivos enviados serão armazenados temporariamente na memória do server
const upload = multer({ // aqui nos configuramos o multer passando essas opções, storage: storage referenciando que vamos usar o armazenamento de memoria
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5mb, essa conta equivale a 5mb de tamanho max de arquivo
    }
})

// usamos patch para atualizar o status do pedido, então patch porque iremos atualizar apenas uma propiedade e não todo pedido
router.patch("/order/:orderId/status", jwtCheck, jwtParse, MyRestaurantController.updateOrderStatus)

// GET /api/my/restaurant
router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant) // rota para obtermos os dados do nosso restaurante

// essa rota e para pegarmos todos pedidos que meu restaurante possui
router.get("/order", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurantOrders)

// api/my/restaurant
router.post(
    "/",
    upload.single("imageFile"), // upload.single("imageFile") essa função e um middleware fornecida pelo multer, ela e usada para lidar com o upload de um unico arquivo. No caso específico, está configurado para lidar com uploads de um arquivo com o campo de formulário chamado "imageFile". Isso significa que, na solicitação POST para essa rota, o campo do formulário chamado "imageFile" será o campo que contém o arquivo que está sendo enviado.
    validateMyRestaurantRequest, // serve para validarmos o conteudo recebido na request
    jwtCheck,
    jwtParse,
    MyRestaurantController.createMyRestaurant
);

router.put(
    "/", 
    upload.single("imageFile"), // upload.single("imageFile") essa função e um middleware fornecida pelo multer, ela e usada para lidar com o upload de um unico arquivo. No caso específico, está configurado para lidar com uploads de um arquivo com o campo de formulário chamado "imageFile". Isso significa que, na solicitação POST para essa rota, o campo do formulário chamado "imageFile" será o campo que contém o arquivo que está sendo enviado.
    validateMyRestaurantRequest, // serve para validarmos o conteudo recebido na request
    jwtCheck,
    jwtParse,
    MyRestaurantController.updateMyRestaurant
    )


export default router;
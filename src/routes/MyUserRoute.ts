import express from 'express'
import MyUserController from '../controllers/MyUserController';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateMyUserRequest } from '../middleware/validation';

const router = express.Router();

// /api/my/user
router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser) // criamos a rota get para obter os dados do usuario que serão usados para preencher o formulario de update automaticamente, para isso verificamos se o jwt e valido (jwtCheck), depois fazemos o parse do jwt para pegar o Id desse usuario (jwtParse), por ultimo executamos nossa controller que vai buscar esse user para a gente
// /api/my/user se recebermos uma request para esse endpoint e se for uma request de post, então esse handler será chamado e vou passar minha request para userController.createCurrent
router.post("/", jwtCheck, MyUserController.createCurrentUser) // Verificamos apenas se o user esta logado antes de cria-lo na base de dados do backend
router.put("/",  jwtCheck, jwtParse, validateMyUserRequest, MyUserController.updateCurrentUser) // jwtCheck verificamos se ele estar logado e depois executamos o middleware jwt Parse para conseguir decodificar o seu token e obter o seu Id, validateMyUserRequest valida o nosso conteudo do body antes de executar o nosso controller onde de fato atualizamos o usuario


export default router;
import mongoose, { InferSchemaType, mongo } from "mongoose";


const menuItemSchema = new mongoose.Schema({ // criamos um schema de menuItem mas usamos ele no schema do restaurant
    _id: {type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId()}, // definimos que esse schema teremos um id para o item informamos que ele vai ser do tipo ObjectId, required=true significa que ele é obrigatorio, "default: () => new mongoose.Types.ObjectId()" aqui nos definimos que o seu valor padrão sera um objectId que o propio mongoose vai criar
    name: { type: String, required: true },
    price: { type: Number, required: true }
})


export type MenuItemType = InferSchemaType<typeof menuItemSchema>
// usamos o inferSchemaType para extrair um tipo e passarmos para "MenuItemType", para extrair um tipo passamos o tipo dentro de "<>" como nosso "menuItemSchema" ele é um schema e não um type, usamos o typeof para pegar o type do schema

const restaurantSchema = new mongoose.Schema({ //criando um schema para restaurant
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // aqui dizemos que esse User vai ser do tipo de dados ObjectId,Ele é usado para armazenar os identificadores exclusivos dos documentos no MongoDB, ref: "User" significa que estamos relacionando esse campo com um Mondel User. ou seja um restaurante vai ter um usuario
    restaurantName: { type: String, required: true }, // Criamos um campo para nome
    city: { type: String, required: true },  // Criamos um capo para city
    country: { type: String, required: true },  // Criamos um campo para country
    deliveryPrice: { type: Number, required: true },  // Criamos um campo para Delivery Price
    estimatedDeliveryTime: { type: Number, required: true },  // Criamos um campo para estimatedDeliveryTime
    cuisines: [{ type: String, required: true }], // criamos esse campo para cozinhas, significa que vamos ter uma lista com varias cozinhas
    menuItems: [menuItemSchema], // Criamos um menu de items, vai ser uma lista de items
    imageUrl: { type: String, required: true}, // isso vai ser uma url que vamos obter de volta do cloud
    lastUpdated: { type: Date, required: true} // isso vai ser um campo de Data
})

const Restaurant = mongoose.model("Restaurant", restaurantSchema); // criamos e exportamos o model

export default Restaurant;
import mongoose from "mongoose";


const menuItemSchema = new mongoose.Schema({ // criamos um schema de menuItem mas usamos ele no schema do restaurant
    name: { type: String, required: true },
    price: { type: Number, required: true }
})


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
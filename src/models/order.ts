import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // aqui criamos um schema para nosso pedido
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }, // dizemos que nesse schema teremos um campo para restaurant, então dizemos que o campo sera do tipo ObjectId do propio mongoose, depois passamos ref= para indicar uma refêrencia a nosso schema "Restaurant"
    user:{ type: mongoose.Schema.Types.ObjectId, ref: "User" }, // dizemos que nesse schema teremos um campo para restaurant, então dizemos que o campo sera do tipo ObjectId do propio mongoose, depois passamos ref= para indicar uma refêrencia a nosso schema "User"
    deliveryDetails: { // aqui dizemos que teremos essa propiedade de deliveryDetails que é um objeto
        email: { type: String, required: true },
        name: { type: String, required: true },
        addressLine1: { type: String, required: true },
        city: { type: String, required: true },
        /*
        Aqui informamos as propiedades que teremos e os seus tipo: que serão todos string, required true indica que essas propiedades são obrigatoria
        */
    },
    cartItems: [
        // cartItems essa propiedade indica que teremos um array de objetos aqui
        {
            menuItemId: { type: String, required: true }, // indicamos o id do item do pedido
            name: { type: String, required: true }, // indicamos a quantidade do item do pedido 
            quantity: { type: Number, required: true }, // indicamos o nome do item do pedido
            /*
                Aqui dizemos que teremos um objeto com essas propiedades
            */
        },
    ],
    totalAmount: Number, // teremos essa propiedade também para indicar o total do pedido
    status: { // aqui teremos essa propiedade status que vai conter o status do nosso pedido
        type: String, // indicamos que vai ser o tipo string
        enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"] // aqui fazemos um enum para definir os estados possiveis do pedido
    },
    createdAt: { type: Date, default: Date.now },
    // createdaAt indica a data e hora que o pedido foi feito
});

const Order = mongoose.model("Order", orderSchema) // criamos nosso model

export default Order; // exportamos o model
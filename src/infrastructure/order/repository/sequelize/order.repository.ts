
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";


export default class OrderRepository implements OrderRepositoryInterface{

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  
  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
          customerId: entity.customerId,
          items: entity.items,
          total: entity.total()
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  }
  async findById(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        include: ["item"],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Customer not found");
    }
    var orderItem = orderModel.items.map(i => new OrderItem(i.id,i.name,i.price,i.product_id,i.quantity));
    var order = new Order(id, orderModel.customer_id, orderItem);
    return order;
  }

  async findAll(): Promise<Order[]> {
     const customerModels = await OrderModel.findAll();
     var orders: Order[];

    const customers = customerModels.map((orderModels) => {
      var orderItems = orderModels.items.map(i => new OrderItem(i.id,i.name,i.price,i.product_id,i.quantity))
      orders.push(new Order(orderModels.id, orderModels.customer_id, orderItems));

    });
    return orders;
  }
  
}

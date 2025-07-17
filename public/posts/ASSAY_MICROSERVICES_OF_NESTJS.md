# Эссе: Современная Архитектура Микросервисов на NestJS

## Введение

NestJS — это прогрессивный (то есть, использующий современные подходы и инструменты для разработки) фреймворк для Node.js, который идеально подходит для создания масштабируемых и поддерживаемых серверных приложений. Одной из его ключевых возможностей является нативная (встроенная в фреймворк "из коробки") поддержка микросервисной архитектуры.

**Микросервисная архитектура** — это подход к разработке, при котором одно большое приложение разбивается на набор небольших, независимо развертываемых сервисов. Каждый сервис отвечает за свою бизнес-логику, имеет собственную базу данных и может быть написан на своем стеке технологий.

В этом эссе мы рассмотрим современный подход к организации взаимодействия между микросервисами на примере двух сервисов:

1.  **Сервис Продуктов (`products-service`)**: Отвечает за CRUD (создание, чтение, обновление, удаление) операции с продуктами.
2.  **Сервис Постов (`posts-service`)**: Отвечает за CRUD операции с постами.

Ключевая задача — при получении конкретного поста, мы должны обогатить (дополнить) его данными о связанных продуктах, запросив их у `products-service`.

## Архитектурный Обзор

Современные микросервисные системы редко позволяют клиентам (например, браузеру или мобильному приложению) обращаться к каждому сервису напрямую. Вместо этого используется паттерн (шаблон проектирования) **API Gateway**.

**API Gateway (API-шлюз)** — это единая точка входа для всех клиентских запросов. Он маршрутизирует (направляет) запросы к соответствующим внутренним микросервисам, может выполнять аутентификацию, логирование и другие сквозные задачи.

Наша архитектура будет выглядеть так:

```mermaid
graph TD
    Client[Клиент (Браузер)] -->|HTTP/REST| APIGateway[API Gateway]

    subgraph "Внутренняя сеть (gRPC)"
        APIGateway -->|gRPC| PostsService[Сервис Постов]
        APIGateway -->|gRPC| ProductsService[Сервис Продуктов]
        PostsService -->|gRPC| ProductsService
    end

    subgraph "Базы данных"
        PostsService --> PostsDB[(Posts DB)]
        ProductsService --> ProductsDB[(Products DB)]
    end
```

Для взаимодействия между сервисами мы выберем **gRPC** — высокопроизводительный фреймворк для удаленного вызова процедур (RPC), разработанный Google. Его преимущества:

-   **Производительность**: Работает поверх HTTP/2, что значительно быстрее традиционного REST+JSON.
-   **Строгая типизация**: Использует Protocol Buffers для определения контрактов (структур данных и сервисов), что обеспечивает безопасность типов между сервисами, написанными на разных языках.

---

## Шаг 1: Настройка Проекта и Общие Ресурсы

Для управления несколькими приложениями в одном репозитории удобно использовать **монорепозиторий**. Мы можем организовать его с помощью встроенных средств NestJS или инструментов вроде Nx.

Структура проекта:

```
/
├── apps/
│   ├── api-gateway/      # Наш HTTP шлюз
│   ├── posts-service/    # Сервис постов
│   └── products-service/ # Сервис продуктов
├── libs/
│   └── proto/            # Общие proto-файлы для gRPC
│       ├── products.proto
│       └── posts.proto
└── package.json
```

### `products.proto`

Определим контракт для сервиса продуктов.

```protobuf
syntax = "proto3";

package products;

// Сервис для управления продуктами
service ProductsService {
  rpc CreateProduct (CreateProductRequest) returns (Product);
  rpc FindAllProducts (FindAllProductsRequest) returns (ProductsResponse);
  rpc FindProductById (FindProductByIdRequest) returns (Product);
  // Добавим метод для поиска продуктов по массиву ID
  rpc FindProductsByIds (FindProductsByIdsRequest) returns (ProductsResponse);
}

message Product {
  string id = 1;
  string name = 2;
  float price = 3;
}

message CreateProductRequest {
  string name = 1;
  float price = 2;
}

message FindAllProductsRequest {}

message FindProductByIdRequest {
  string id = 1;
}

message FindProductsByIdsRequest {
  repeated string ids = 1; // `repeated` означает, что это массив
}

message ProductsResponse {
  repeated Product products = 1;
}
```

---

## Шаг 2: Реализация Сервиса Продуктов (`products-service`)

Это будет NestJS-приложение, работающее как gRPC-сервер.

**`main.ts`**:

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		{
			transport: Transport.GRPC, // Указываем транспорт gRPC
			options: {
				package: "products", // Имя пакета из .proto файла
				protoPath: join(__dirname, "../proto/products.proto"), // Путь к контракту
				url: "0.0.0.0:50051", // Адрес, на котором сервис будет слушать запросы
			},
		}
	);
	await app.listen();
}
bootstrap();
```

**`products.controller.ts`**:
Контроллер в NestJS-микросервисе слушает не HTTP-пути, а сообщения или RPC-вызовы.

```typescript
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { ProductsService } from "./products.service";
import { FindProductsByIdsRequest } from "./interfaces/products.interface"; // Сгенерированные интерфейсы

@Controller()
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	// `GrpcMethod` связывает метод класса с RPC-вызовом из .proto файла
	@GrpcMethod("ProductsService", "CreateProduct")
	createProduct(data: { name: string; price: number }) {
		return this.productsService.create(data);
	}

	@GrpcMethod("ProductsService", "FindProductById")
	findProductById(data: { id: string }) {
		return this.productsService.findById(data.id);
	}

	// Наш ключевой метод для межсервисного взаимодействия
	@GrpcMethod("ProductsService", "FindProductsByIds")
	findProductsByIds(data: FindProductsByIdsRequest) {
		return this.productsService.findByIds(data.ids);
	}
}
```

_Сервис `products.service.ts` будет содержать простую логику для работы с массивом или базой данных._

---

## Шаг 3: Реализация Сервиса Постов (`posts-service`)

Этот сервис будет одновременно:

1.  **gRPC-сервером** для `API Gateway`.
2.  **gRPC-клиентом** для `products-service`.

**`posts.module.ts`**:
Здесь мы регистрируем клиент для подключения к сервису продуктов.

```typescript
import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";

@Module({
	imports: [
		// Регистрация gRPC клиента
		ClientsModule.register([
			{
				name: "PRODUCTS_PACKAGE", // Инъекционный токен для использования клиента
				transport: Transport.GRPC,
				options: {
					package: "products",
					protoPath: join(__dirname, "../proto/products.proto"),
					url: "products-service:50051", // Адрес сервиса продуктов (в Docker-сети)
				},
			},
		]),
	],
	controllers: [PostsController],
	providers: [PostsService],
})
export class PostsModule {}
```

**`posts.service.ts`**:
Сервис, который реализует основную логику.

```typescript
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
	ProductsService, // Это интерфейс, а не конкретный класс
	ProductsResponse,
} from "./interfaces/products.interface";

@Injectable()
export class PostsService implements OnModuleInit {
	// Приватное свойство для хранения экземпляра gRPC-клиента
	private productsService: ProductsService;

	constructor(
		@Inject("PRODUCTS_PACKAGE") private readonly client: ClientGrpc
	) {}

	// `onModuleInit` - хук жизненного цикла, вызывается после инициализации модуля
	onModuleInit() {
		// Получаем конкретную реализацию сервиса по его имени из .proto
		this.productsService =
			this.client.getService<ProductsService>("ProductsService");
	}

	async findPostById(id: string) {
		// 1. Получаем пост из своей базы данных
		const post = { id, title: "Мой первый пост", productIds: ["1", "3"] }; // Пример

		// 2. Вызываем метод `findProductsByIds` у сервиса продуктов
		const productsResponse: ProductsResponse = await this.productsService
			.findProductsByIds({ ids: post.productIds })
			.toPromise();

		// 3. Обогащаем пост данными о продуктах
		return { ...post, products: productsResponse.products };
	}
}
```

---

## Шаг 4: Реализация API Gateway

Это обычное NestJS-приложение с HTTP-контроллерами, которое выступает клиентом для обоих сервисов.

**`app.module.ts`**:

```typescript
@Module({
	imports: [
		ClientsModule.register([
			{
				name: "PRODUCTS_PACKAGE",
				/* ...конфигурация клиента продуктов... */
			},
			{
				name: "POSTS_PACKAGE",
				/* ...конфигурация клиента постов... */
			},
		]),
	],
	controllers: [AppController],
})
export class AppModule {}
```

**`app.controller.ts`**:

```typescript
import { Controller, Get, Inject, OnModuleInit, Param } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { PostsService } from "./interfaces/posts.interface";

@Controller()
export class AppController implements OnModuleInit {
	private postsService: PostsService;

	constructor(@Inject("POSTS_PACKAGE") private readonly client: ClientGrpc) {}

	onModuleInit() {
		this.postsService =
			this.client.getService<PostsService>("PostsService");
	}

	@Get("posts/:id")
	getPostById(@Param("id") id: string) {
		// Просто проксируем (перенаправляем) запрос в сервис постов
		return this.postsService.findPostById({ id });
	}
}
```

## Заключение

Мы рассмотрели современный, надежный и масштабируемый способ построения микросервисной архитектуры с использованием NestJS.

**Ключевые принципы, которые мы применили**:

1.  **Единая точка входа (API Gateway)**: Упрощает клиентскую логику и централизует сквозные задачи.
2.  **Межсервисное взаимодействие через gRPC**: Обеспечивает высокую производительность и строгую типизацию благодаря Protocol Buffers.
3.  **Разделение ответственности (Separation of Concerns)**: Каждый сервис отвечает только за свою бизнес-область и имеет собственную базу данных.
4.  **Обнаружение сервисов (Service Discovery)**: В реальном мире адреса сервисов (`products-service:50051`) не хардкодятся (не прописываются жестко в коде), а управляются специальными инструментами, такими как Consul или Kubernetes Services.
5.  **Асинхронное взаимодействие**: Все вызовы через `ClientGrpc` возвращают `Observable` (реактивный поток данных), что позволяет строить гибкие и неблокирующие системы.

Этот подход, хотя и требует больше начальной настройки по сравнению с монолитом (приложением, где весь функционал находится в одной кодовой базе), обеспечивает невероятную гибкость, масштабируемость и отказоустойчивость для сложных систем. NestJS предоставляет элегантные и мощные абстракции (упрощенные представления сложных систем), которые делают процесс построения таких архитектур значительно проще.

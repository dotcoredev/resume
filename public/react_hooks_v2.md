# Хуки в React: Полное руководство (React 19)

## Введение

Хуки в React — это не магия, это инструменты для решения конкретных проблем. Главная проблема разработчиков: они используют хуки "на всякий случай" вместо понимания их назначения. Давайте разберем каждый хук с практическими примерами и четкими принципами использования.

## Базовые хуки

### 1. useState — Управление состоянием

**Принцип**: Используйте для данных, которые изменяются и влияют на отображение.

```tsx
// ✅ Правильно - состояние влияет на UI
const [count, setCount] = useState(0);

// ❌ Неправильно - константа не должна быть в состоянии
const [apiUrl] = useState("https://api.example.com"); // Лучше: const apiUrl = 'https://api.example.com'

// ✅ Правильно - пользовательский ввод
const [username, setUsername] = useState("");
```

**Когда НЕ использовать**: Для констант, вычисляемых значений, refs.

### 2. useEffect — Побочные эффекты

**Принцип**: Используйте для синхронизации компонента с внешними системами.

```tsx
// ✅ Правильно - подписка на внешние события
useEffect(() => {
	const handleResize = () => setWindowWidth(window.innerWidth);
	window.addEventListener("resize", handleResize);
	return () => window.removeEventListener("resize", handleResize);
}, []);

// ❌ Неправильно - обработка пользовательских событий
useEffect(() => {
	// Это должно быть в onClick handler
	if (buttonClicked) {
		handleButtonClick();
	}
}, [buttonClicked]);

// ✅ Правильно - сетевые запросы
useEffect(() => {
	fetchUserData(userId).then(setUser);
}, [userId]);
```

**Когда НЕ использовать**: Для обработки пользовательских событий, вычислений, которые можно сделать при рендере.

### 3. useContext — Передача данных через дерево компонентов

**Принцип**: Используйте для глобального состояния или избежания prop drilling.

```tsx
// ✅ Правильно - глобальная тема
const ThemeContext = createContext<"light" | "dark">("light");

// ✅ Правильно - данные пользователя
const UserContext = createContext<User | null>(null);

// ❌ Неправильно - локальное состояние
const CountContext = createContext<number>(0); // Лучше передать через пропсы
```

## Хуки производительности

### 4. useCallback — Мемоизация функций

**Принцип**: Используйте ТОЛЬКО когда функция передается как пропс в дочерний компонент или в зависимости других хуков.

```tsx
// ❌ Бесполезно - функция не передается никуда
const handleClick = useCallback(() => {
	console.log("clicked");
}, []);

// ✅ Правильно - передается в дочерний компонент
const ExpensiveChild = React.memo(({ onClick }) => {
	// Тяжелый компонент
	return <button onClick={onClick}>Click me</button>;
});

const Parent = () => {
	const [count, setCount] = useState(0);

	// Без useCallback ExpensiveChild будет перерендериваться
	const handleClick = useCallback(() => {
		console.log("clicked");
	}, []);

	return <ExpensiveChild onClick={handleClick} />;
};
```

### 5. useMemo — Мемоизация вычислений

**Принцип**: Используйте для дорогих вычислений или создания стабильных ссылок на объекты.

```tsx
// ✅ Правильно - дорогое вычисление
const expensiveValue = useMemo(() => {
	return heavyCalculation(data);
}, [data]);

// ❌ Неправильно - простое вычисление
const simpleValue = useMemo(() => {
	return a + b; // Это быстрее без useMemo
}, [a, b]);

// ✅ Правильно - стабильная ссылка на объект
const config = useMemo(
	() => ({
		apiUrl: "https://api.example.com",
		timeout: 5000,
	}),
	[]
); // Объект не пересоздается при каждом рендере
```

## Хуки для работы со ссылками

### 6. useRef — Ссылки на DOM и мутабельные значения

**Принцип**: Используйте для доступа к DOM элементам или хранения мутабельных значений, которые не влияют на рендер.

```tsx
// ✅ Правильно - DOM элемент
const inputRef = useRef<HTMLInputElement>(null);
const focusInput = () => inputRef.current?.focus();

// ✅ Правильно - мутабельное значение (не влияет на рендер)
const timerRef = useRef<NodeJS.Timeout | null>(null);

// ❌ Неправильно - значение влияет на рендер
const countRef = useRef(0); // Лучше: useState(0)
```

### 7. useImperativeHandle — Кастомизация ref-а

**Принцип**: Используйте для кастомизации значения, которое передается через ref в родительский компонент.

```tsx
// ✅ Правильно - кастомный API для компонента
const FancyInput = forwardRef<{ focus: () => void }, { value: string }>(
	(props, ref) => {
		const inputRef = useRef<HTMLInputElement>(null);

		useImperativeHandle(ref, () => ({
			focus: () => {
				inputRef.current?.focus();
			},
		}));

		return <input ref={inputRef} value={props.value} />;
	}
);

// Использование
const Parent = () => {
	const inputRef = useRef<{ focus: () => void }>(null);

	return (
		<div>
			<FancyInput ref={inputRef} value="test" />
			<button onClick={() => inputRef.current?.focus()}>Focus</button>
		</div>
	);
};
```

**Когда НЕ использовать**: В 99% случаев лучше использовать обычные пропсы.

## Хуки для сложного состояния

### 8. useReducer — Сложная логика состояния

**Принцип**: Используйте когда логика состояния сложная или состояние имеет несколько связанных значений.

```tsx
// ✅ Правильно - сложная логика
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
	switch (action.type) {
		case "increment":
			return { ...state, count: state.count + state.step };
		case "decrement":
			return { ...state, count: state.count - state.step };
		case "reset":
			return initialState;
		default:
			throw new Error();
	}
}

const [state, dispatch] = useReducer(reducer, initialState);

// ❌ Неправильно - простое состояние
const [count, dispatch] = useReducer(
	(state, action) => (action.type === "increment" ? state + 1 : state - 1),
	0
); // Лучше: useState(0)
```

## Хуки для отладки

### 9. useDebugValue — Отладочная информация

**Принцип**: Используйте для отображения отладочной информации в React DevTools.

```tsx
// ✅ Правильно - в кастомном хуке
function useCounter(initialValue = 0) {
	const [count, setCount] = useState(initialValue);

	useDebugValue(count > 5 ? "High" : "Low");

	return [count, setCount];
}

// ❌ Неправильно - в обычном компоненте
const MyComponent = () => {
	const [count, setCount] = useState(0);
	useDebugValue(count); // Бесполезно

	return <div>{count}</div>;
};
```

**Когда НЕ использовать**: В production коде, в обычных компонентах.

## Хуки для работы с layout

### 10. useLayoutEffect — Синхронные эффекты

**Принцип**: Используйте для синхронных DOM мутаций, которые должны произойти до отрисовки.

```tsx
// ✅ Правильно - измерение DOM элементов
const [height, setHeight] = useState(0);
const ref = useRef<HTMLDivElement>(null);

useLayoutEffect(() => {
	if (ref.current) {
		setHeight(ref.current.getBoundingClientRect().height);
	}
}, []);

// ❌ Неправильно - асинхронные операции
useLayoutEffect(() => {
	fetchData().then(setData); // Блокирует отрисовку!
}, []);
```

**Когда НЕ использовать**: Для асинхронных операций, сетевых запросов.

## Хуки для работы с id

### 11. useId — Уникальные идентификаторы

**Принцип**: Используйте для генерации уникальных ID для доступности и связывания элементов.

```tsx
// ✅ Правильно - связывание label и input
const MyForm = () => {
	const nameId = useId();
	const emailId = useId();

	return (
		<form>
			<label htmlFor={nameId}>Name:</label>
			<input id={nameId} type="text" />

			<label htmlFor={emailId}>Email:</label>
			<input id={emailId} type="email" />
		</form>
	);
};

// ❌ Неправильно - для ключей списков
const items = data.map((item) => (
	<li key={useId()}>{item.name}</li> // Вызовет ошибку!
));
```

**Когда НЕ использовать**: Для ключей в списках, для состояния.

## Хуки для переходов (React 18+)

### 12. useTransition — Неблокирующие обновления

**Принцип**: Используйте для пометки обновлений как неприоритетных.

```tsx
// ✅ Правильно - дорогие обновления
const [isPending, startTransition] = useTransition();
const [input, setInput] = useState("");
const [list, setList] = useState([]);

const handleChange = (e) => {
	// Немедленное обновление
	setInput(e.target.value);

	// Неприоритетное обновление
	startTransition(() => {
		setList(generateHeavyList(e.target.value));
	});
};

return (
	<div>
		<input value={input} onChange={handleChange} />
		{isPending ? <div>Loading...</div> : <List items={list} />}
	</div>
);
```

### 13. useDeferredValue — Отложенные значения

**Принцип**: Используйте для отложения обновления дорогих компонентов.

```tsx
// ✅ Правильно - отложенное обновление
const [input, setInput] = useState("");
const deferredInput = useDeferredValue(input);

return (
	<div>
		<input value={input} onChange={(e) => setInput(e.target.value)} />
		<HeavyComponent query={deferredInput} />
	</div>
);
```

## Хуки для синхронизации (React 18+)

### 14. useSyncExternalStore — Внешние хранилища

**Принцип**: Используйте для подписки на внешние хранилища данных.

```tsx
// ✅ Правильно - подписка на внешний store
const useStore = (selector) => {
	return useSyncExternalStore(
		store.subscribe,
		() => selector(store.getState()),
		() => selector(store.getServerState())
	);
};

// Использование
const count = useStore((state) => state.count);
```

### 15. useInsertionEffect — Вставка стилей

**Принцип**: Используйте для вставки стилей в DOM до useLayoutEffect.

```tsx
// ✅ Правильно - CSS-in-JS библиотеки
const useStyles = (styles) => {
	useInsertionEffect(() => {
		const styleSheet = document.createElement("style");
		styleSheet.textContent = styles;
		document.head.appendChild(styleSheet);

		return () => {
			document.head.removeChild(styleSheet);
		};
	}, [styles]);
};
```

## Экспериментальные хуки (React 19)

### 16. use — Чтение ресурсов

**Принцип**: Используйте для чтения промисов и контекста.

```tsx
// ✅ Правильно - чтение промиса
const Comments = ({ commentsPromise }) => {
	const comments = use(commentsPromise);

	return (
		<div>
			{comments.map((comment) => (
				<Comment key={comment.id} text={comment.text} />
			))}
		</div>
	);
};

// ✅ Правильно - условное чтение контекста
const Button = ({ theme }) => {
	const actualTheme = theme || use(ThemeContext);

	return <button className={actualTheme}>Click me</button>;
};
```

### 17. useOptimistic — Оптимистичные обновления

**Принцип**: Используйте для немедленного отображения ожидаемого результата.

```tsx
// ✅ Правильно - оптимистичное обновление
const [messages, setMessages] = useState([]);
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
	messages,
	(state, newMessage) => [...state, newMessage]
);

const sendMessage = async (text) => {
	addOptimisticMessage({ text, pending: true });

	try {
		const message = await postMessage(text);
		setMessages((prev) => [...prev, message]);
	} catch (error) {
		// Откатываем оптимистичное обновление
		console.error("Failed to send message");
	}
};
```

### 18. useActionState — Состояние действий

**Принцип**: Используйте для управления состоянием асинхронных действий.

```tsx
// ✅ Правильно - состояние формы
const [state, submitAction, isPending] = useActionState(
	async (prevState, formData) => {
		try {
			await submitForm(formData);
			return { success: true, error: null };
		} catch (error) {
			return { success: false, error: error.message };
		}
	},
	{ success: false, error: null }
);

return (
	<form action={submitAction}>
		<input name="email" type="email" />
		<button disabled={isPending}>
			{isPending ? "Submitting..." : "Submit"}
		</button>
		{state.error && <p className="error">{state.error}</p>}
	</form>
);
```

## Практические Принципы

### 1. Правило зависимостей

```tsx
// ✅ Все используемые переменные в зависимостях
useEffect(() => {
	fetchData(userId, filter);
}, [userId, filter]);

// ❌ Пропущенные зависимости
useEffect(() => {
	fetchData(userId, filter);
}, [userId]); // filter пропущен!
```

### 2. Не оптимизируйте преждевременно

```tsx
// ❌ Ненужная оптимизация
const MyComponent = () => {
	const handleClick = useCallback(() => {
		console.log("click");
	}, []); // Бесполезно если не передается в дочерние компоненты

	return <button onClick={handleClick}>Click</button>;
};

// ✅ Простое решение
const MyComponent = () => {
	const handleClick = () => {
		console.log("click");
	};

	return <button onClick={handleClick}>Click</button>;
};
```

### 3. Стабильность ссылок

```tsx
// ❌ Нестабильная ссылка
const MyComponent = () => {
	const config = { apiUrl: "https://api.com" }; // Новый объект каждый рендер

	useEffect(() => {
		fetchWithConfig(config);
	}, [config]); // Будет вызываться каждый рендер
};

// ✅ Стабильная ссылка
const MyComponent = () => {
	const config = useMemo(
		() => ({
			apiUrl: "https://api.com",
		}),
		[]
	); // Объект создается один раз

	useEffect(() => {
		fetchWithConfig(config);
	}, [config]);
};
```

## Заключение

**Главное правило**: Используйте хуки для решения конкретных проблем, а не "на всякий случай".

### Базовые хуки (используйте часто):

-   **useState** — для UI состояния
-   **useEffect** — для синхронизации с внешними системами
-   **useContext** — для глобального состояния

### Хуки производительности (используйте осторожно):

-   **useCallback** — только когда функция передается в дочерние компоненты
-   **useMemo** — для дорогих вычислений и стабильных ссылок

### Специализированные хуки (используйте по необходимости):

-   **useRef** — для DOM и мутабельных значений
-   **useReducer** — для сложной логики состояния
-   **useLayoutEffect** — для синхронных DOM операций
-   **useId** — для уникальных идентификаторов

### Современные хуки (React 18+):

-   **useTransition** — для неблокирующих обновлений
-   **useDeferredValue** — для отложенных значений
-   **useSyncExternalStore** — для внешних хранилищ

### Экспериментальные хуки (React 19):

-   **use** — для чтения ресурсов
-   **useOptimistic** — для оптимистичных обновлений
-   **useActionState** — для состояния действий

Помните: простой код лучше оптимизированного, но сложного кода. Начинайте с простого решения и оптимизируйте только при необходимости!

Similar code found with 2 license types

# Code Citations

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const input
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const input
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    use
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    use
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, ()
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, ()
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () =>
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () =>
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }));

    return <input ref
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }));

    return <input ref
```

## License: MIT

https://github.com/GildedPleb/eslint-config-current-thing/blob/ddd8c2c0ffa8864f52d1ff9caf1ce8b3403cc459/src/conflicts/code-samples/tsx.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }));

    return <input ref=
```

## License: unknown

https://github.com/harisejaz2206/react-basics-project/blob/26529ddad736fdf177d9be1abc8652e6e1cc50fd/src/components/FancyInput.tsx

```
}>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }));

    return <input ref=
```

## License: unknown

https://github.com/alimohamed33/react-quiz/blob/ae9e5d8ea7ccd787b10e32012e1100d178a36bc8/src/components/DateCounter.js

```
step: 1 };

function reducer(state, action) {
```

## License: unknown

https://github.com/jegius/react-hooks/blob/6a83979ede89e95adc2d6b9eb41b7d38749d441a/useReducer/use-reducer/src/reducer-example/ReducerExample.jsx

```
step: 1 };

function reducer(state, action) {
```

## License: unknown

https://github.com/alimohamed33/react-quiz/blob/ae9e5d8ea7ccd787b10e32012e1100d178a36bc8/src/components/DateCounter.js

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
```

## License: unknown

https://github.com/jegius/react-hooks/blob/6a83979ede89e95adc2d6b9eb41b7d38749d441a/useReducer/use-reducer/src/reducer-example/ReducerExample.jsx

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
```

## License: unknown

https://github.com/alimohamed33/react-quiz/blob/ae9e5d8ea7ccd787b10e32012e1100d178a36bc8/src/components/DateCounter.js

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state
```

## License: unknown

https://github.com/jegius/react-hooks/blob/6a83979ede89e95adc2d6b9eb41b7d38749d441a/useReducer/use-reducer/src/reducer-example/ReducerExample.jsx

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state
```

## License: unknown

https://github.com/alimohamed33/react-quiz/blob/ae9e5d8ea7ccd787b10e32012e1100d178a36bc8/src/components/DateCounter.js

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state.step };
        case 'decrement':
            return { ...
```

## License: unknown

https://github.com/jegius/react-hooks/blob/6a83979ede89e95adc2d6b9eb41b7d38749d441a/useReducer/use-reducer/src/reducer-example/ReducerExample.jsx

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state.step };
        case 'decrement':
            return { ...
```

## License: unknown

https://github.com/alimohamed33/react-quiz/blob/ae9e5d8ea7ccd787b10e32012e1100d178a36bc8/src/components/DateCounter.js

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state.step };
        case 'decrement':
            return { ...state, count: state.count - state.step }
```

## License: unknown

https://github.com/jegius/react-hooks/blob/6a83979ede89e95adc2d6b9eb41b7d38749d441a/useReducer/use-reducer/src/reducer-example/ReducerExample.jsx

```
step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state.step };
        case 'decrement':
            return { ...state, count: state.count - state.step }
```

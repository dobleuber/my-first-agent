# 🧠 Workshop – Crea tu primer AI Agent con LangGraph

Este repositorio contiene los pasos y materiales necesarios para completar el workshop de creación de agentes conversacionales con [LangGraph](https://github.com/langchain-ai/langgraph).

Aprenderás a generar un proyecto desde cero usando [`create-agent-chat-app`](https://github.com/langchain-ai/create-agent-chat-app) y a personalizar un agente ReAct dentro de una app React con Next.js.

---

## 🚀 Paso 1 – Genera tu proyecto

Ejecuta el siguiente comando en tu terminal:

```bash
npx create-agent-chat-app
```

Responde a las siguientes opciones cuando se te pregunte:

```
◇  What is the name of your project? my-first-agent
◇  Which package manager would you like to use? › npm
◇  Would you like to automatically install dependencies? Y
◇  Which framework would you like to use? › Next.js
◆  Which pre-built agents would you like to include?
│  [x] ReAct Agent
│  [ ] Memory Agent
│  [ ] Research Agent
│  [ ] Retrieval Agent
```

Esto creará una nueva carpeta `my-first-agent` con todo el código necesario para empezar.

---

## 🤮 Paso 2 – Configura las variables de entorno

Dentro del directorio del proyecto (`my-first-agent`), copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

> 📁 Este archivo contiene las claves necesarias para ejecutar el agente. Asegúrate de reemplazar los valores por tus propias credenciales antes de continuar.

Necesitarás obtener claves API desde los siguientes proveedores:

* [Anthropic](https://console.anthropic.com/account/keys)
* [OpenAI](https://platform.openai.com/api-keys)
* [Tavily](https://app.tavily.com/settings/api-keys)
* Gemini, Grok, etc.

---

## 💻 Paso 3 – Ejecuta el proyecto en desarrollo

Dentro del directorio del proyecto:

```bash
npm run dev
```

Luego abre tu navegador en:

```
http://localhost:3000
```

Ahí podrás empezar a interactuar con tu primer agente conversacional.

---

## 🎓 Paso 4 – ¿Y ahora qué?

Durante el workshop aprenderemos a:

* Entender la arquitectura general de un agente ReAct
* Leer y modificar el grafo del agente
* Personalizar herramientas
* Agregar "memoria" o conocimiento adicional
* Usar otras APIs o LLMs según el caso

---

## 📖 Recursos adicionales

* [Documentación oficial de LangGraph](https://docs.langchain.com/langgraph)
* [Guía del generador create-agent-chat-app](https://github.com/langchain-ai/create-agent-chat-app)
* [Ejemplo de agente ReAct](https://github.com/langchain-ai/langgraph/blob/main/examples/react/README.md)

---

## ✨ Crédito

Este workshop fue preparado por \[Tu Nombre] para ayudar a desarrolladores a dar sus primeros pasos construyendo agentes conversacionales con LangGraph.

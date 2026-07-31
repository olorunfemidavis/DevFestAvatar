# DevFestAvatar

**Leer esto en otros idiomas:**  
[English](../../README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Português](README.pt.md) | [Èdè Yorùbá](README.yo.md) | [Deutsch](README.de.md) | [Türkçe](README.tr.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [日本語](README.ja.md) | [Kiswahili](README.sw.md)

DevFestAvatar es una aplicación web ligera para crear avatares de perfil para DevFest 2026. Los usuarios suben una foto, eligen un marco de DevFest y descargan o comparten el resultado. El flujo estándar se ejecuta localmente en el navegador.

Aplicación en vivo: [https://devfestavatar.web.app](https://devfestavatar.web.app)

<img src="../../public/images/icons/logos/wide.png" width="400" alt="DevFestAvatar logo">

## Características

- Sube, recorta, enmarca, descarga y comparte avatares de DevFest.
- Interfaz inspirada en impresos de DevFest 2026 con soporte para temas claro y oscuro.
- Diseño adaptativo para teléfonos, tabletas y computadoras.
- Flujo opcional de edición de imágenes con Gemini a través de Firebase Functions.

## Desarrollo Local

```powershell
http-server ./public -p 8081
```

Abre la URL impresa por `http-server` en tu navegador.

# Portafolio · Martín Leal / Norte Sistemas

Sitio estático (HTML, CSS y JavaScript sin dependencias) publicado con GitHub Pages:
**https://martinleal95.github.io/portafolio/**

## Características
- Modo claro/oscuro con preferencia guardada, y transición papel ↔ tinta por sección.
- Animaciones con `IntersectionObserver`; respeta `prefers-reduced-motion`.
- Accesible: enlace "saltar al contenido", foco visible, contrastes revisados, `aria-*` en controles.
- SEO: metadatos Open Graph, JSON-LD (`Person`), `sitemap.xml`, `robots.txt`, manifest, 404.

## Estructura
```
index.html          Página única
css/styles.css      Tokens, temas y componentes
js/main.js          Interacciones
assets/brand/       Logos vectoriales (SVG) e íconos
assets/projects/    Capturas de proyectos (WebP)
```

## Uso local
```
python3 -m http.server 8000
```

## Licencia
Código bajo MIT. Marca, logos e imágenes de proyectos: todos los derechos reservados.

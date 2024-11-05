// Archivo: script.js

// Función para saludar a un usuario
function saludar(nombre) {
    return `Hola, ${nombre}!`;
  }
  
  // Función para sumar dos números
  function sumar(a, b) {
    return a + b;
  }
  
  // Llamadas a las funciones y almacenamiento de resultados
  const nombreUsuario = 'Gabriel';
  const saludo = saludar(nombreUsuario);
  const suma = sumar(5, 3);
  
  // Imprimir los resultados en la consola
  console.log(saludo); // Output: Hola, Gabriel!
  console.log(`La suma de 5 + 3 es: ${suma}`); // Output: La suma de 5 + 3 es: 8
  
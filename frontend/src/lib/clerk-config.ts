export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  // Verificar que las claves existan y no sean las claves de ejemplo
  return !!(
    publishableKey && 
    secretKey &&
    publishableKey !== 'pk_test_ejemplo_desarrollo_1234567890abcdef' &&
    secretKey !== 'sk_test_ejemplo_desarrollo_1234567890abcdef' &&
    publishableKey.startsWith('pk_') &&
    secretKey.startsWith('sk_')
  );
}

export function getClerkSetupInstructions() {
  return {
    title: 'Configuración de Clerk requerida',
    steps: [
      'Ve a https://clerk.com y crea una cuenta gratuita',
      'Crea una nueva aplicación en tu dashboard',
      'Copia las claves API de tu aplicación',
      'Actualiza el archivo .env con tus claves reales',
      'Reinicia Docker Compose: docker compose restart'
    ],
    envExample: `CLERK_SECRET_KEY=sk_test_tu_clave_secreta_real
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_publica_real`
  };
}
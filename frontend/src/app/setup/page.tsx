'use client';

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuración de Clerk
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Para usar la autenticación, necesitas configurar Clerk
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Configuración requerida:</strong>
                </p>
                <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
                  <li>Ve a <a href="https://clerk.com" target="_blank" className="underline">clerk.com</a> y crea una cuenta</li>
                  <li>Crea una nueva aplicación</li>
                  <li>Copia las claves de tu dashboard</li>
                  <li>Actualiza el archivo .env con tus claves reales</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-600 font-mono">
              CLERK_SECRET_KEY=sk_test_tu_clave_secreta<br/>
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_publica
            </p>
          </div>
          
          <p className="text-sm text-gray-500">
            Una vez configurado, reinicia Docker Compose para aplicar los cambios.
          </p>
        </div>
      </div>
    </div>
  );
}
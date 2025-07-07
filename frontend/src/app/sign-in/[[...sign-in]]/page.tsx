import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión en FacturSaaS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu sistema de facturación
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              card: "shadow-lg",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: 
                "border-gray-300 hover:bg-gray-50 text-gray-700",
              dividerLine: "bg-gray-300",
              dividerText: "text-gray-500"
            }
          }}
          routing="hash"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
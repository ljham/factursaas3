'use client';

import { UserProfile } from '@clerk/nextjs';
import AppLayout from '@/components/AppLayout';

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Perfil de Usuario
            </h1>
            <p className="text-gray-600 mb-6">
              Gestiona tu información personal, configuración de cuenta y métodos de autenticación
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <UserProfile 
              appearance={{
                elements: {
                  card: "shadow-none border-0",
                  navbar: "hidden",
                  navbarMobileMenuRow: "hidden",
                  headerTitle: "text-xl font-semibold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                  formButtonSecondary: "border-gray-300 text-gray-700 hover:bg-gray-50",
                  socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50 text-gray-700",
                  dividerLine: "bg-gray-300",
                  dividerText: "text-gray-500",
                  formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                  formFieldLabel: "text-gray-700 font-medium",
                  alertText: "text-sm",
                  identityPreviewText: "text-gray-900",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700"
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  showOptionalFields: true
                }
              }}
              routing="hash"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
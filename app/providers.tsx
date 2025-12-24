'use client'

import { SessionProvider } from 'next-auth/react'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import { PriceAlertsProvider } from './contexts/PriceAlertsContext'
import { AvailabilityProvider } from './contexts/AvailabilityContext'
import { RemindersProvider } from './contexts/RemindersContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PreferencesProvider>
        <NotificationsProvider>
          <PriceAlertsProvider>
            <AvailabilityProvider>
              <RemindersProvider>
                {children}
              </RemindersProvider>
            </AvailabilityProvider>
          </PriceAlertsProvider>
        </NotificationsProvider>
      </PreferencesProvider>
    </SessionProvider>
  )
}


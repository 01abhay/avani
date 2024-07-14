import '~/styles/globals.css'

import { Poppins } from 'next/font/google'
import { type Metadata } from 'next'

import { TRPCReactProvider } from '~/trpc/react'

const poppins = Poppins({ weight: ['400', '500', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PureElegance: powered by Avani AI',
  description: 'The beauty store',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#5bbad5' />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='theme-color' content='#ffffff' />
      </head>
      <body className={poppins.className}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}

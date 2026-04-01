import React from 'react'

export default function CommonProtectedLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <>
    {
        children
    }
    </>
  )
}

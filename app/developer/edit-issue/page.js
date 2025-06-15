'use client'

import { Suspense } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EditIssueFormDeveloper from '../../components/EditIssueFormDeveloper'

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <EditIssueFormDeveloper />
      </Suspense>
      <ToastContainer />
    </>
  )
}

'use client'

import { Suspense } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EditIssueFormAdmin from '../../components/EditIssueFormAdmin'

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <EditIssueFormAdmin />
      </Suspense>
      <ToastContainer />
    </>
  )
}

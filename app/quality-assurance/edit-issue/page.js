'use client'

import { Suspense } from 'react'
import EditIssueForm from '../../components/EditIssueForm'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <EditIssueForm />
      </Suspense>
      <ToastContainer />
    </>
  )
}

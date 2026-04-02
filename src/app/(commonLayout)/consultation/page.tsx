import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React from 'react'
import { getDoctors } from './_actions';
import DoctorsList from '@/components/modules/consultation/doctorsList';

export default async function ConsultationPage() {

  //server site prerendering or prefetching using tanstack query
  const queryClient = new QueryClient();
  
  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors
  })
  
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsList/>
      </HydrationBoundary>
    </div>
  )
}

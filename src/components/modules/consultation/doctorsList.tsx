"use client";
import { getDoctors } from "@/app/(commonLayout)/consultation/_actions";
import { useQuery } from "@tanstack/react-query";

export default function DoctorsList() {
  //client side fetching using tanstack query
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
  });

  console.log("prefetching data", data);

  //non prefetching data
  const {data:doctorData} = useQuery({
    queryKey:["non-prefetch-data"],
    queryFn: ()=> getDoctors()
  })

  console.log("non prefetching data",doctorData)

  return (
    <div>
      {data?.data?.map((doctor: any) => (
        <div key={doctor.id}>name: {doctor.name}</div>
      ))}
    </div>
  );
}

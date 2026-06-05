import { getWebinarAttendance } from '@/actions/attendence'
import PageHeader from '@/components/ReuseableComponents/PageHeader/page'
import { HomeIcon } from '@/icons/Homeicon'
import { LeadIcon } from '@/icons/Leadicon'
import { PipelineIcon } from '@/icons/Pipelineicon'
import React from 'react'
import PipelineLayout from './_components/Pipelayout'
import { AttendedTypeEnum } from '@prisma/client'
import { formatColumnTitle } from './_components/utils'

type Props = {
  webinarId: string
}



const page = async ({ params }: Props) => {
  const { webinarId } = await params
  const pipelineData = await getWebinarAttendance(webinarId)

  if (!pipelineData.data) {
  return (
    <div className="text-3xl h-[400px] flex justify-center items-center">
      No Pipelines Found
    </div>
  )
}

  // Data is fetched dynamically from the database
  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<LeadIcon className="w-4 h-4" />}
        mainIcon={<PipelineIcon className="w-12 h-12" />}
        rightIcon={<HomeIcon className="w-3 h-3" />}
        heading="Keep track of all of your customers"
        placeholder="Search Name, Tag or Email"
      />
      <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
  {Object.entries(pipelineData.data).map(([columnType,
  columnData]) => (
    <PipelineLayout
      key={columnType}
      title={formatColumnTitle(columnType as
      AttendedTypeEnum)}
      count={columnData.count}
      users={columnData.users}
      tags={pipelineData.webinarTags}
    />
  ))}
</div>

    </div>
  )
}

export default page

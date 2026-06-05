import PageHeader from '@/components/ReuseableComponents/PageHeader/page'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadIcon } from '@/icons/Leadicon'
import { PipelineIcon } from '@/icons/Pipelineicon'
import { Webcam } from 'lucide-react'
import React from 'react'
import { getLeads } from '@/actions/leads'

type Props = {}

export default async function Page(props: Props) {
  const leadsResponse = await getLeads()
  const leads = leadsResponse.status === 200 ? leadsResponse.data : []

  return (
    <div className='w-full flex flex-col gap-8'>
        <PageHeader
        leftIcon={<Webcam className='w-3 h-3'/>}
        mainIcon={<LeadIcon className='w-12 h-12'/>}
        rightIcon={<PipelineIcon className='w-3 h-3'/>}
        heading='The home to all your customers'
        placeholder='search customer...'
        />
            <Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-sm text-muted-foreground">
        Name
      </TableHead>
      <TableHead className="text-sm text-muted-foreground">
        Email
      </TableHead>
      <TableHead className="text-sm text-muted-foreground">
        Phone
      </TableHead>
      <TableHead className="text-right text-sm text-muted-foreground">
        Tags
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {leads?.map((lead, idx) => (
  <TableRow
    key={idx}
    className="border-0"
  >
    <TableCell className="font-medium">{lead?.name}</TableCell>
    <TableCell>{lead?.email}</TableCell>
    <TableCell>{lead?.phone}</TableCell>
    <TableCell className="text-right">
      {lead?.tags?.map((tag, idx) => (
        <Badge
          key={idx}
          variant="outline"
        >
          {tag}
        </Badge>
      ))}
    </TableCell>
  </TableRow>
))}

  </TableBody>
</Table>


    </div>
  )
}
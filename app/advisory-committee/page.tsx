import React from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import {
  Users,
  Mail,
  ExternalLink,
  Clock,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UACMeetings } from '@/components/uac-meetings';
import { getPublicDirectusClient } from '@/lib/directus-server';
import { readSingleton } from '@directus/sdk';

// Type definitions for Directus data
interface UACMember {
  name: string;
  organization: string;
  additional_details?: string;
}

interface ContactResource {
  title: string;
  url: string;
  icon?: string;
}

interface AdvisoryCommitteePageData {
  page_title: string;
  page_description: string;
  meeting_schedule_note: string;
  membership_description: string;
  uac_members: UACMember[];
  contact_resources: ContactResource[];
}

export default async function AdvisoryCommitteePage() {
  const directus = await getPublicDirectusClient();

  const data = await directus.request<AdvisoryCommitteePageData>(
    readSingleton('advisory_committee_page', {
      fields: ['*']
    })
  );
  return (
    <DocsPage>
      <DocsBody className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {data.page_title}
          </h1>
          <p className="text-muted-foreground">
            {data.page_description}
          </p>
        </div>

        {/* Meeting Information */}
        {data.meeting_schedule_note && (
          <Alert className="mb-8">
            <Clock className="h-4 w-4" />
            <AlertTitle>Meeting Schedule</AlertTitle>
            <AlertDescription className="mt-2">
              {data.meeting_schedule_note}
            </AlertDescription>
          </Alert>
        )}

        {/* UAC Meeting Videos */}
        <div className="mb-12 pb-8 border-b">
          <UACMeetings />
        </div>

        {/* UAC Membership Section */}
        {data.uac_members && data.uac_members.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                UAC Membership
              </CardTitle>
              {data.membership_description && (
                <CardDescription className="mb-4">
                  {data.membership_description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%] font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Organization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.uac_members.map((member) => (
                      <TableRow key={member.name} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{member.organization}</p>
                            {member.additional_details && (
                              <p className="text-sm text-muted-foreground">{member.additional_details}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {data.contact_resources && data.contact_resources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                {data.contact_resources.map((resource, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="flex-1 justify-start" 
                    asChild
                  >
                    <a 
                      href={resource.url}
                      target={resource.url.startsWith('http') ? '_blank' : undefined}
                      rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {resource.icon === 'mail' ? (
                        <Mail className="h-4 w-4 mr-2" />
                      ) : resource.icon === 'external_link' ? (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      {resource.title}
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DocsBody>
    </DocsPage>
  );
}

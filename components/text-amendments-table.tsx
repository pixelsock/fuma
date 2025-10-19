'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextAmendment } from '@/lib/types/text-amendments';

interface TextAmendmentsTableProps {
  className?: string;
}

export function TextAmendmentsTable({ className }: TextAmendmentsTableProps) {
  const [amendments, setAmendments] = useState<TextAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchAmendments() {
      try {
        setLoading(true);
        const response = await fetch('/api/text-amendments');
        if (!response.ok) {
          throw new Error('Failed to fetch text amendments');
        }
        const data = await response.json();
        setAmendments(data);
      } catch (error) {
        console.error('Error fetching text amendments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAmendments();
  }, []);

  const filteredAmendments = amendments.filter(amendment =>
    amendment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amendment.petition_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amendment.ordinance_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (amendment: TextAmendment) => {
    if (amendment.city_council_decision_date?.includes('Denied')) {
      return <Badge variant="destructive">Denied</Badge>;
    }
    if (amendment.public_hearing_date === 'Withdrawn') {
      return <Badge variant="secondary">Withdrawn</Badge>;
    }
    if (amendment.effective_date && amendment.effective_date !== 'N/A') {
      return <Badge variant="default">Effective</Badge>;
    }
    if (amendment.city_council_decision_date && !amendment.city_council_decision_date.includes('Denied')) {
      return <Badge variant="outline">Approved</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Text Amendments</CardTitle>
          <CardDescription>Loading text amendments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Text Amendments</CardTitle>
        <CardDescription>
          Charlotte UDO text amendments and ordinance changes
        </CardDescription>
        <div className="flex items-center space-x-2 pt-4">
          <Input
            placeholder="Search amendments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Petition #</TableHead>
                <TableHead>Ordinance #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>Public Hearing</TableHead>
                <TableHead>Committee Date</TableHead>
                <TableHead>Council Decision</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAmendments.length > 0 ? (
                filteredAmendments.map((amendment) => (
                  <TableRow key={amendment.id}>
                    <TableCell className="font-medium">
                      {amendment.petition_number}
                    </TableCell>
                    <TableCell>
                      {amendment.ordinance_number}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={amendment.title}>
                        {amendment.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {amendment.filing_date}
                    </TableCell>
                    <TableCell>
                      {amendment.public_hearing_date}
                    </TableCell>
                    <TableCell>
                      {amendment.zoning_planning_committee_date}
                    </TableCell>
                    <TableCell>
                      {amendment.city_council_decision_date}
                    </TableCell>
                    <TableCell>
                      {amendment.effective_date}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(amendment)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No amendments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

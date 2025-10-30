import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { UDOContentRenderer } from '@/components/udo-content-renderer';
import { ArticleTitleHeader } from '@/components/article-title-header';
import fs from 'fs';
import path from 'path';

export default function TestDocxConversionPage() {
	// Read the converted HTML files
	const publicDir = path.join(process.cwd(), 'public');
	
	const testDocxPath = path.join(publicDir, 'test-docx-result.html');
	const testDocxContent = fs.existsSync(testDocxPath) 
		? fs.readFileSync(testDocxPath, 'utf-8')
		: '<p>No converted content available. Please run the conversion script first.</p>';

	const article5Path = path.join(publicDir, 'article5.html');
	const article5Content = fs.existsSync(article5Path)
		? fs.readFileSync(article5Path, 'utf-8')
		: '<p>Desired output not available.</p>';

	const currentStatePath = path.join(publicDir, 'current-state.html');
	const currentStateContent = fs.existsSync(currentStatePath)
		? fs.readFileSync(currentStatePath, 'utf-8')
		: '<p>Current state not available.</p>';

	return (
		<DocsPage 
			toc={[]}
			tableOfContent={{
				style: 'clerk',
				enabled: false,
			}}
		>
			<DocsBody>
				<ArticleTitleHeader 
					category="Testing"
					title="DOCX Conversion Test - Article 6"
					slug="test-docx-conversion"
					description="Testing the enhanced DOCX converter with actual UDO article styling"
				/>

				{/* Comparison Tabs */}
				<div className="mb-8 border rounded-lg overflow-hidden">
					<div className="bg-gray-50 border-b p-4">
						<h2 className="text-lg font-semibold mb-2">Conversion Comparison</h2>
						<p className="text-sm text-gray-600">
							This page shows three versions of Article 6 content to compare the DOCX conversion results:
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<a 
								href="#converted" 
								className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
							>
								1. Converted (test.docx)
							</a>
							<a 
								href="#desired" 
								className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
							>
								2. Desired Output
							</a>
							<a 
								href="#original" 
								className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
							>
								3. Original State
							</a>
						</div>
					</div>
				</div>

				{/* Converted Version */}
				<div id="converted" className="mb-12 scroll-mt-20">
					<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
						<h3 className="text-lg font-semibold text-blue-900 mb-1">
							1. Converted Version (Enhanced DOCX Output)
						</h3>
						<p className="text-sm text-blue-700">
							This is the result of processing <code className="bg-blue-100 px-2 py-0.5 rounded">test.docx</code> through 
							the enhanced DOCX converter with all improvements applied.
						</p>
					</div>
					<UDOContentRenderer htmlContent={testDocxContent} />
				</div>

				<hr className="my-12 border-t-2 border-gray-200" />

				{/* Desired Version */}
				<div id="desired" className="mb-12 scroll-mt-20">
					<div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
						<h3 className="text-lg font-semibold text-green-900 mb-1">
							2. Desired Output (Target Format)
						</h3>
						<p className="text-sm text-green-700">
							This is the manually formatted version that represents the ideal output format 
							we want the converter to match.
						</p>
					</div>
					<UDOContentRenderer htmlContent={article5Content} />
				</div>

				<hr className="my-12 border-t-2 border-gray-200" />

				{/* Original State */}
				<div id="original" className="mb-12 scroll-mt-20">
					<div className="bg-gray-50 border-l-4 border-gray-500 p-4 mb-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-1">
							3. Original State (Before Enhancement)
						</h3>
						<p className="text-sm text-gray-700">
							This is the original DOCX conversion output before applying any enhancements, 
							showing what the converter produced initially.
						</p>
					</div>
					<UDOContentRenderer htmlContent={currentStateContent} />
				</div>

				{/* Summary Section */}
				<div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
					<h3 className="text-xl font-bold text-blue-900 mb-3">Conversion Summary</h3>
					<div className="space-y-2 text-sm">
						<div className="flex items-start gap-2">
							<span className="text-green-600 font-bold">✓</span>
							<span>Headings converted to proper <code className="bg-white px-2 py-0.5 rounded">h2</code> tags</span>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-600 font-bold">✓</span>
							<span>Section headers with <code className="bg-white px-2 py-0.5 rounded">&lt;br&gt;</code> tags and content on same line</span>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-600 font-bold">✓</span>
							<span>Tables with complete structure (wrapper, thead, colgroup, styling)</span>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-600 font-bold">✓</span>
							<span>Footnotes extracted to separate <code className="bg-white px-2 py-0.5 rounded">div.footnote</code> blocks</span>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-600 font-bold">✓</span>
							<span>Images with production URLs and dimension attributes</span>
						</div>
					</div>
					<div className="mt-4 pt-4 border-t border-blue-200">
						<p className="text-xs text-blue-700">
							<strong>Script Location:</strong> <code className="bg-white px-2 py-0.5 rounded">/backend/scripts/enhance-docx-html.ts</code>
						</p>
						<p className="text-xs text-blue-700 mt-1">
							<strong>Test Script:</strong> <code className="bg-white px-2 py-0.5 rounded">/backend/scripts/test-docx-conversion.ts</code>
						</p>
					</div>
				</div>
			</DocsBody>
		</DocsPage>
	);
}

export function generateMetadata() {
	return {
		title: 'DOCX Conversion Test - Article 6',
		description: 'Testing the enhanced DOCX converter with actual UDO article styling and layout',
	};
}

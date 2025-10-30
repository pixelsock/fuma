import fs from 'fs';
import path from 'path';
import './styles.css';

export default function TestDocxResultPage() {
	// Read the converted HTML file
	const htmlPath = path.join(process.cwd(), 'public', 'test-docx-result.html');
	const htmlContent = fs.existsSync(htmlPath) 
		? fs.readFileSync(htmlPath, 'utf-8')
		: '<p>No converted content available. Please run the conversion script first.</p>';

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<div className="mb-8 border-b pb-4">
				<h1 className="text-3xl font-bold mb-2">DOCX Conversion Test Result</h1>
				<p className="text-gray-600">
					This page displays the result of converting <code className="bg-gray-100 px-2 py-1 rounded">test.docx</code> through the enhanced DOCX converter.
				</p>
				<div className="mt-4 flex gap-4">
					<a 
						href="/article5.html" 
						target="_blank"
						className="text-blue-600 hover:underline"
					>
						View Desired Output (article5.html) →
					</a>
					<a 
						href="/current-state.html" 
						target="_blank"
						className="text-blue-600 hover:underline"
					>
						View Original State (current-state.html) →
					</a>
				</div>
			</div>

			{/* Render the converted HTML with UDO table styling */}
			<div 
				className="prose prose-lg max-w-none udo-content"
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
}

"""
Google Sheets Service Module
Handles all Google Sheets operations for the pharmacovigilance application
Based on the robust approach from the provided Node.js implementation
"""

import gspread
import base64
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from flask import current_app
from google.oauth2.service_account import Credentials


class GoogleSheetsService:
    """Service class for Google Sheets operations"""
    
    def __init__(self):
        self.gc = None
        self.spreadsheet = None
        self.worksheets = {}
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Google Sheets client with service account using multiple authentication approaches"""
        try:
            # Environment variable validation
            required_env_vars = ['GOOGLE_SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY']
            missing_env_vars = [var for var in required_env_vars if not os.environ.get(var)]
            
            if missing_env_vars:
                current_app.logger.error(f"Missing required environment variables: {', '.join(missing_env_vars)}")
                return
            
            # Debug logging for environment variables
            current_app.logger.info("Environment Variables Check:")
            current_app.logger.info(f"GOOGLE_SHEET_ID exists: {bool(os.environ.get('GOOGLE_SHEET_ID'))}")
            current_app.logger.info(f"GOOGLE_SERVICE_ACCOUNT_EMAIL exists: {bool(os.environ.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'))}")
            current_app.logger.info(f"GOOGLE_PRIVATE_KEY exists: {bool(os.environ.get('GOOGLE_PRIVATE_KEY'))}")
            current_app.logger.info(f"GOOGLE_PRIVATE_KEY length: {len(os.environ.get('GOOGLE_PRIVATE_KEY', ''))}")
            
            # Get configuration from environment
            sheet_id = os.environ.get('GOOGLE_SHEET_ID')
            service_account_email = os.environ.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
            private_key = os.environ.get('GOOGLE_PRIVATE_KEY')
            
            current_app.logger.info('Google Sheets Configuration:')
            current_app.logger.info(f'GOOGLE_SHEET_ID: {sheet_id}')
            current_app.logger.info(f'GOOGLE_SERVICE_ACCOUNT_EMAIL: {service_account_email}')
            current_app.logger.info(f'GOOGLE_PRIVATE_KEY length: {len(private_key)}')
            
            # Try multiple authentication approaches
            success = False
            
            # APPROACH 1: Direct authentication with key formatting
            try:
                current_app.logger.info('Trying authentication approach 1: Direct with replace')
                formatted_key = private_key
                
                # If the key doesn't start with -----BEGIN PRIVATE KEY-----, it might need formatting
                if '-----BEGIN PRIVATE KEY-----' not in formatted_key:
                    current_app.logger.info('Private key needs formatting')
                    # Try to fix common issues with private keys in environment variables
                    formatted_key = formatted_key.replace('\\n', '\n')
                    
                    # If it still doesn't have the correct format, try to decode it
                    if '-----BEGIN PRIVATE KEY-----' not in formatted_key:
                        current_app.logger.info('Private key still needs additional formatting')
                        try:
                            # Try to decode if it's base64 encoded
                            import base64
                            formatted_key = base64.b64decode(formatted_key).decode('utf8')
                        except Exception as decode_error:
                            current_app.logger.error(f'Error decoding private key: {decode_error}')
                
                # Remove any surrounding quotes if present
                if formatted_key.startswith('"') and formatted_key.endswith('"'):
                    formatted_key = formatted_key[1:-1]
                
                # Ensure the key has the correct header and footer
                if not formatted_key.startswith('-----BEGIN PRIVATE KEY-----'):
                    formatted_key = '-----BEGIN PRIVATE KEY-----\n' + formatted_key
                if not formatted_key.endswith('-----END PRIVATE KEY-----'):
                    formatted_key = formatted_key + '\n-----END PRIVATE KEY-----'
                
                current_app.logger.info('Private key format check:')
                current_app.logger.info(f'- Contains BEGIN marker: {"-----BEGIN PRIVATE KEY-----" in formatted_key}')
                current_app.logger.info(f'- Contains END marker: {"-----END PRIVATE KEY-----" in formatted_key}')
                current_app.logger.info(f'- Contains newlines: {chr(10) in formatted_key}')
                
                # Create credentials
                credentials_dict = {
                    "type": "service_account",
                    "client_email": service_account_email,
                    "private_key": formatted_key,
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
                
                self.gc = gspread.service_account_from_dict(credentials_dict)
                success = True
                current_app.logger.info('Authentication approach 1 successful')
                
            except Exception as auth_error1:
                current_app.logger.error(f'Authentication approach 1 failed: {auth_error1}')
                
                # APPROACH 2: With explicit newline handling
                try:
                    current_app.logger.info('Trying authentication approach 2: With explicit newlines')
                    private_key_with_newlines = private_key.replace('\\n', '\n').strip('"')
                    
                    credentials_dict = {
                        "type": "service_account",
                        "client_email": service_account_email,
                        "private_key": private_key_with_newlines,
                        "token_uri": "https://oauth2.googleapis.com/token"
                    }
                    
                    self.gc = gspread.service_account_from_dict(credentials_dict)
                    success = True
                    current_app.logger.info('Authentication approach 2 successful')
                    
                except Exception as auth_error2:
                    current_app.logger.error(f'Authentication approach 2 failed: {auth_error2}')
                    
                    # APPROACH 3: Using google-auth directly
                    try:
                        current_app.logger.info('Trying authentication approach 3: Using google-auth directly')
                        
                        scopes = [
                            'https://www.googleapis.com/auth/spreadsheets',
                            'https://www.googleapis.com/auth/drive'
                        ]
                        
                        credentials_info = {
                            "type": "service_account",
                            "client_email": service_account_email,
                            "private_key": private_key.replace('\\n', '\n'),
                            "token_uri": "https://oauth2.googleapis.com/token"
                        }
                        
                        credentials = Credentials.from_service_account_info(credentials_info, scopes=scopes)
                        self.gc = gspread.authorize(credentials)
                        success = True
                        current_app.logger.info('Authentication approach 3 successful')
                        
                    except Exception as auth_error3:
                        current_app.logger.error(f'Authentication approach 3 failed: {auth_error3}')
                        current_app.logger.error('All authentication approaches failed')
                        return
            
            if not success:
                current_app.logger.error('All authentication approaches failed')
                return
            
            # Open the spreadsheet
            current_app.logger.info('Opening spreadsheet...')
            self.spreadsheet = self.gc.open_by_key(sheet_id)
            current_app.logger.info(f'Loaded document: {self.spreadsheet.title}')
            
            self._setup_worksheets()
            
        except Exception as e:
            current_app.logger.error(f"Failed to initialize Google Sheets client: {e}")
            current_app.logger.error(f"Error details: {e}")
            if hasattr(e, '__traceback__'):
                import traceback
                current_app.logger.error(f"Stack trace: {traceback.format_exc()}")
            self.gc = None
    
    def _setup_worksheets(self):
        """Setup required worksheets for different report types using robust approach"""
        if not self.spreadsheet:
            return
        
        worksheet_configs = {
            'adverse_reactions': {
                'headers': [
                    'Timestamp', 'ID', 'Patient Age', 'Patient Gender', 'Patient Weight',
                    'Drug Name', 'Drug Manufacturer', 'Drug Batch Number', 'Drug Dosage',
                    'Drug Route', 'Drug Indication', 'Reaction Description', 'Reaction Severity',
                    'Reaction Start Date', 'Reaction End Date', 'Reaction Outcome',
                    'Reporter Name', 'Reporter Phone', 'Reporter Email', 'Reporter Type',
                    'Governorate', 'City', 'Pharmacy Name', 'Pharmacy Address',
                    'Concomitant Drugs', 'Medical History', 'Status', 'Priority',
                    'Assigned To', 'Follow Up Required', 'Notes'
                ]
            },
            'intruder_reports': {
                'headers': [
                    'Timestamp', 'ID', 'Governorate', 'Pharmacy Name', 'Pharmacy Address',
                    'Pharmacy License', 'Intruder Name', 'Intruder Role', 'Intruder Real Job',
                    'Intruder Residence', 'Intruder ID Number', 'Problem Description',
                    'Evidence Description', 'Reporter Name', 'Reporter Phone', 'Reporter Email',
                    'Reporter Anonymous', 'Status', 'Confirmed', 'Priority', 'Assigned To', 'Notes'
                ]
            }
        }
        
        for sheet_name, config in worksheet_configs.items():
            try:
                # Try to get existing worksheet
                try:
                    worksheet = self.spreadsheet.worksheet(sheet_name)
                    current_app.logger.info(f'Found existing {sheet_name} sheet')
                    
                    # IMPORTANT: Force update all headers to ensure correct structure
                    try:
                        current_app.logger.info(f'Attempting to update all headers on existing {sheet_name} sheet')
                        worksheet.update('1:1', [config['headers']])
                        current_app.logger.info('All headers updated successfully')
                    except Exception as update_header_error:
                        current_app.logger.error(f'Failed to update all headers: {update_header_error}')
                        current_app.logger.info('Will try to continue with existing headers')
                        
                        # Check if we need to add specific missing columns
                        try:
                            headers = worksheet.row_values(1) if worksheet.row_count > 0 else []
                            current_app.logger.info(f'Current headers: {headers}')
                            
                            required_headers = config['headers']
                            missing_headers = [h for h in required_headers if h not in headers]
                            
                            if missing_headers:
                                current_app.logger.info(f'Missing headers: {", ".join(missing_headers)}')
                                
                                # Try to add missing headers one by one
                                for header in missing_headers:
                                    try:
                                        # Add the header to the end of the current headers
                                        new_headers = headers + [header]
                                        worksheet.update('1:1', [new_headers])
                                        headers = new_headers
                                        current_app.logger.info(f'Added missing header: {header}')
                                    except Exception as single_header_error:
                                        current_app.logger.error(f'Failed to add header {header}: {single_header_error}')
                        except Exception as check_headers_error:
                            current_app.logger.error(f'Error checking headers: {check_headers_error}')
                    
                    self.worksheets[sheet_name] = worksheet
                    
                except gspread.WorksheetNotFound:
                    # Create new worksheet
                    current_app.logger.info(f'Creating new {sheet_name} sheet')
                    try:
                        worksheet = self.spreadsheet.add_worksheet(
                            title=sheet_name,
                            rows=1000,
                            cols=len(config['headers'])
                        )
                        # Add headers
                        worksheet.update('1:1', [config['headers']])
                        self.worksheets[sheet_name] = worksheet
                        current_app.logger.info(f'New sheet created successfully with all headers: {sheet_name}')
                    except Exception as create_error:
                        current_app.logger.error(f'Error creating new sheet {sheet_name}: {create_error}')
                        
                        # Try to use the first sheet if available
                        sheets = self.spreadsheet.worksheets()
                        if sheets:
                            worksheet = sheets[0]
                            current_app.logger.info(f'Using existing first sheet: {worksheet.title}')
                            
                            # Try to set headers on this sheet
                            try:
                                worksheet.update('1:1', [config['headers']])
                                self.worksheets[sheet_name] = worksheet
                                current_app.logger.info('Headers set on existing sheet')
                            except Exception as header_error:
                                current_app.logger.error(f'Failed to set headers on existing sheet: {header_error}')
                                self.worksheets[sheet_name] = worksheet  # Use it anyway
                        else:
                            current_app.logger.error('No sheets available and unable to create new sheet')
                
            except Exception as e:
                current_app.logger.error(f"Failed to setup worksheet {sheet_name}: {e}")
    
    def is_available(self) -> bool:
        """Check if Google Sheets service is available"""
        return self.gc is not None and self.spreadsheet is not None
    
    def _save_report_with_fallback(self, sheet_name: str, row_data: Dict[str, Any]) -> bool:
        """Save report using multiple fallback methods like the Node.js implementation"""
        if not self.is_available() or sheet_name not in self.worksheets:
            return False
        
        try:
            current_app.logger.info(f'Starting to save report to {sheet_name} sheet')
            worksheet = self.worksheets[sheet_name]
            current_app.logger.info('Sheet initialized successfully')
            
            current_app.logger.info(f'Prepared row data: {json.dumps(row_data, default=str)}')
            
            # Try multiple methods to add the row to the sheet
            success = False
            
            # METHOD 1: Standard addRow method
            try:
                current_app.logger.info('Trying standard method to add row')
                # Ensure the order of values matches the headers
                ordered_row_values = [row_data.get(header, '') for header in worksheet.row_values(1)]
                worksheet.append_row(ordered_row_values)
                current_app.logger.info('Report saved to Google Sheets successfully using standard method')
                success = True
            except Exception as add_row_error:
                current_app.logger.error(f'Error adding row with standard method: {add_row_error}')
                current_app.logger.error(f'Error details: {add_row_error}')
            
            # METHOD 2: Try to append to any sheet if Method 1 failed
            if not success:
                try:
                    current_app.logger.info('Trying to append to any available sheet')
                    
                    # Get all sheets
                    sheets = self.spreadsheet.worksheets()
                    if sheets:
                        # Try each sheet until one works
                        for any_sheet in sheets:
                            try:
                                current_app.logger.info(f'Trying to append to sheet: {any_sheet.title}')
                                
                                # Get headers and map our data
                                headers = any_sheet.row_values(1) if any_sheet.row_count > 0 else []
                                
                                # Create row values based on headers
                                row_values = []
                                for header in headers:
                                    if header in row_data:
                                        row_values.append(row_data[header])
                                    else:
                                        row_values.append('')  # Empty string for missing data
                                
                                any_sheet.append_row(row_values)
                                current_app.logger.info(f'Successfully added row to sheet: {any_sheet.title}')
                                success = True
                                break  # Exit the loop if successful
                            except Exception as sheet_error:
                                current_app.logger.error(f'Failed to add row to sheet {any_sheet.title}: {sheet_error}')
                                # Continue to next sheet
                except Exception as any_sheet_error:
                    current_app.logger.error(f'Error trying to append to any sheet: {any_sheet_error}')
            
            # METHOD 3: Create a new sheet as last resort
            if not success:
                try:
                    current_app.logger.info("Trying to create a new sheet as last resort")
                    
                    # Create a new sheet with a unique name
                    new_sheet_name = f"{sheet_name}_{int(datetime.now().timestamp())}"
                    new_worksheet = self.spreadsheet.add_worksheet(
                        title=new_sheet_name,
                        rows=1000,
                        cols=len(self.worksheets[sheet_name].row_values(1)) if sheet_name in self.worksheets and self.worksheets[sheet_name].row_count > 0 else 20 # Default columns
                    )
                    
                    # Add headers from the original sheet config or a default set
                    headers_to_use = self.worksheets[sheet_name].row_values(1) if sheet_name in self.worksheets and self.worksheets[sheet_name].row_count > 0 else list(row_data.keys())
                    if headers_to_use:
                        new_worksheet.update("1:1", [headers_to_use])
                    
                    # Add the row to the newly created sheet
                    ordered_row_values = [row_data.get(header, "") for header in headers_to_use]
                    new_worksheet.append_row(ordered_row_values)
                    
                    current_app.logger.info(f"Successfully created new sheet {new_sheet_name} and added row")
                    self.worksheets[new_sheet_name] = new_worksheet # Add to our tracked worksheets
                    success = True
                except Exception as create_sheet_error:
                    current_app.logger.error(f"Failed to create new sheet as last resort: {create_sheet_error}")
            
            return success
        except Exception as e:
            current_app.logger.error(f"Error in _save_report_with_fallback: {e}")
            return False





    
    def add_adverse_reaction(self, report_data: Dict[str, Any]) -> bool:
        """Add adverse reaction report to Google Sheets using robust fallback approach"""
        # Prepare row data with proper mapping
        row_data = {
            'Timestamp': datetime.now().isoformat(),
            'ID': report_data.get('id', ''),
            'Patient Age': report_data.get('patient_age', ''),
            'Patient Gender': report_data.get('patient_gender', ''),
            'Patient Weight': report_data.get('patient_weight', ''),
            'Drug Name': report_data.get('drug_name', ''),
            'Drug Manufacturer': report_data.get('drug_manufacturer', ''),
            'Drug Batch Number': report_data.get('drug_batch_number', ''),
            'Drug Dosage': report_data.get('drug_dosage', ''),
            'Drug Route': report_data.get('drug_route', ''),
            'Drug Indication': report_data.get('drug_indication', ''),
            'Reaction Description': report_data.get('reaction_description', ''),
            'Reaction Severity': report_data.get('reaction_severity', ''),
            'Reaction Start Date': report_data.get('reaction_start_date', ''),
            'Reaction End Date': report_data.get('reaction_end_date', ''),
            'Reaction Outcome': report_data.get('reaction_outcome', ''),
            'Reporter Name': report_data.get('reporter_name', ''),
            'Reporter Phone': report_data.get('reporter_phone', ''),
            'Reporter Email': report_data.get('reporter_email', ''),
            'Reporter Type': report_data.get('reporter_type', ''),
            'Governorate': report_data.get('governorate', ''),
            'City': report_data.get('city', ''),
            'Pharmacy Name': report_data.get('pharmacy_name', ''),
            'Pharmacy Address': report_data.get('pharmacy_address', ''),
            'Concomitant Drugs': report_data.get('concomitant_drugs', ''),
            'Medical History': report_data.get('medical_history', ''),
            'Status': report_data.get('status', 'pending'),
            'Priority': report_data.get('priority', 'normal'),
            'Assigned To': report_data.get('assigned_to', ''),
            'Follow Up Required': report_data.get('follow_up_required', False),
            'Notes': ''
        }
        
        return self._save_report_with_fallback('adverse_reactions', row_data)
    
    def add_intruder_report(self, report_data: Dict[str, Any]) -> bool:
        """Add intruder report to Google Sheets using robust fallback approach"""
        # Prepare row data with proper mapping
        row_data = {
            'Timestamp': datetime.now().isoformat(),
            'ID': report_data.get('id', ''),
            'Governorate': report_data.get('governorate', ''),
            'Pharmacy Name': report_data.get('pharmacy_name', ''),
            'Pharmacy Address': report_data.get('pharmacy_address', ''),
            'Pharmacy License': report_data.get('pharmacy_license', ''),
            'Intruder Name': report_data.get('intruder_name', ''),
            'Intruder Role': report_data.get('intruder_role', ''),
            'Intruder Real Job': report_data.get('intruder_real_job', ''),
            'Intruder Residence': report_data.get('intruder_residence', ''),
            'Intruder ID Number': report_data.get('intruder_id_number', ''),
            'Problem Description': report_data.get('problem_description', ''),
            'Evidence Description': report_data.get('evidence_description', ''),
            'Reporter Name': report_data.get('reporter_name', ''),
            'Reporter Phone': report_data.get('reporter_phone', ''),
            'Reporter Email': report_data.get('reporter_email', ''),
            'Reporter Anonymous': report_data.get('reporter_anonymous', False),
            'Status': report_data.get('status', 'pending'),
            'Confirmed': report_data.get('confirmed', False),
            'Priority': report_data.get('priority', 'normal'),
            'Assigned To': report_data.get('assigned_to', ''),
            'Notes': ''
        }
        
        return self._save_report_with_fallback('intruder_reports', row_data)
    
    def get_reports_summary(self) -> Dict[str, Any]:
        """Get summary statistics from Google Sheets with robust error handling"""
        if not self.is_available():
            return {}
        
        try:
            summary = {}
            
            # Get adverse reactions summary with error handling
            if 'adverse_reactions' in self.worksheets:
                try:
                    worksheet = self.worksheets['adverse_reactions']
                    
                    # Use safer method to get records
                    all_records = self._get_records_safely(worksheet)
                    
                    summary['adverse_reactions'] = {
                        'total': len(all_records),
                        'pending': len([r for r in all_records if r.get('Status', '').lower() == 'pending']),
                        'under_review': len([r for r in all_records if r.get('Status', '').lower() == 'under_review']),
                        'reviewed': len([r for r in all_records if r.get('Status', '').lower() == 'reviewed']),
                        'closed': len([r for r in all_records if r.get('Status', '').lower() == 'closed'])
                    }
                except Exception as adverse_error:
                    current_app.logger.error(f"Error getting adverse reactions summary: {adverse_error}")
                    summary['adverse_reactions'] = {
                        'total': 0, 'pending': 0, 'under_review': 0, 'reviewed': 0, 'closed': 0
                    }
            
            # Get intruder reports summary with error handling
            if 'intruder_reports' in self.worksheets:
                try:
                    worksheet = self.worksheets['intruder_reports']
                    
                    # Use safer method to get records
                    all_records = self._get_records_safely(worksheet)
                    
                    summary['intruder_reports'] = {
                        'total': len(all_records),
                        'pending': len([r for r in all_records if r.get('Status', '').lower() == 'pending']),
                        'investigating': len([r for r in all_records if r.get('Status', '').lower() == 'investigating']),
                        'verified': len([r for r in all_records if r.get('Status', '').lower() == 'verified']),
                        'closed': len([r for r in all_records if r.get('Status', '').lower() == 'closed'])
                    }
                except Exception as intruder_error:
                    current_app.logger.error(f"Error getting intruder reports summary: {intruder_error}")
                    summary['intruder_reports'] = {
                        'total': 0, 'pending': 0, 'investigating': 0, 'verified': 0, 'closed': 0
                    }
            
            return summary
            
        except Exception as e:
            current_app.logger.error(f"Failed to get reports summary from sheets: {e}")
            return {}
    
    def _get_records_safely(self, worksheet) -> List[Dict[str, Any]]:
        """Safely get records from worksheet, handling empty rows and malformed data"""
        try:
            # Get all values from the worksheet
            all_values = worksheet.get_all_values()
            
            if not all_values or len(all_values) < 2:
                # No data or only headers
                return []
            
            # Get headers from first row
            headers = all_values[0]
            records = []
            
            # Process each data row (skip header row)
            for row_index, row in enumerate(all_values[1:], start=2):
                try:
                    # Skip completely empty rows
                    if not any(cell.strip() for cell in row if cell):
                        continue
                    
                    # Create record dictionary, handling missing columns
                    record = {}
                    for col_index, header in enumerate(headers):
                        if col_index < len(row):
                            record[header] = row[col_index].strip()
                        else:
                            record[header] = ''  # Default empty value for missing columns
                    
                    # Only add record if it has some meaningful data
                    if any(value.strip() for value in record.values()):
                        records.append(record)
                        
                except Exception as row_error:
                    current_app.logger.warning(f"Error processing row {row_index}: {row_error}")
                    continue  # Skip problematic rows
            
            return records
            
        except Exception as e:
            current_app.logger.error(f"Error in _get_records_safely: {e}")
            return []
    
    def get_adverse_reactions(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get adverse reaction reports from Google Sheets with optional filters and safe error handling"""
        if not self.is_available() or 'adverse_reactions' not in self.worksheets:
            return []
        
        try:
            worksheet = self.worksheets['adverse_reactions']
            
            # Use safe method to get records
            all_records = self._get_records_safely(worksheet)
            
            # Apply filters if provided
            if filters:
                filtered_records = []
                for record in all_records:
                    include_record = True
                    
                    if filters.get('status') and record.get('Status', '').lower() != filters['status'].lower():
                        include_record = False
                    
                    if filters.get('severity') and record.get('Reaction Severity', '').lower() != filters['severity'].lower():
                        include_record = False
                    
                    if filters.get('drug_name'):
                        drug_name = record.get('Drug Name', '').lower()
                        if filters['drug_name'].lower() not in drug_name:
                            include_record = False
                    
                    if filters.get('governorate') and record.get('Governorate', '').lower() != filters['governorate'].lower():
                        include_record = False
                    
                    if include_record:
                        filtered_records.append(record)
                
                return filtered_records
            
            return all_records
            
        except Exception as e:
            current_app.logger.error(f"Failed to get adverse reactions from sheets: {e}")
            return []
    
    def get_intruder_reports(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get intruder reports from Google Sheets with optional filters and safe error handling"""
        if not self.is_available() or 'intruder_reports' not in self.worksheets:
            return []
        
        try:
            worksheet = self.worksheets['intruder_reports']
            
            # Use safe method to get records
            all_records = self._get_records_safely(worksheet)
            
            # Apply filters if provided
            if filters:
                filtered_records = []
                for record in all_records:
                    include_record = True
                    
                    if filters.get('status') and record.get('Status', '').lower() != filters['status'].lower():
                        include_record = False
                    
                    if filters.get('governorate') and record.get('Governorate', '').lower() != filters['governorate'].lower():
                        include_record = False
                    
                    if filters.get('confirmed_only'):
                        confirmed = record.get('Confirmed', '').lower()
                        if confirmed not in ['true', '1', 'yes', 'confirmed']:
                            include_record = False
                    
                    if include_record:
                        filtered_records.append(record)
                
                return filtered_records
            
            return all_records
            
        except Exception as e:
            current_app.logger.error(f"Failed to get intruder reports from sheets: {e}")
            return []
    
    def update_report_status(self, sheet_name: str, report_id: str, status: str) -> bool:
        """Update report status in Google Sheets"""
        if not self.is_available() or sheet_name not in self.worksheets:
            return False
        
        try:
            worksheet = self.worksheets[sheet_name]
            
            # Find the row with the matching ID
            id_column = worksheet.col_values(1)  # Assuming ID is in first column
            
            for i, cell_id in enumerate(id_column):
                if str(cell_id) == str(report_id):
                    # Update status column (assuming it's in a specific position)
                    if sheet_name == 'adverse_reactions':
                        status_col = 27  # Status column position
                    elif sheet_name == 'intruder_reports':
                        status_col = 18  # Status column position
                    else:
                        return False
                    
                    worksheet.update_cell(i + 1, status_col, status)
                    return True
            
            return False
            
        except Exception as e:
            current_app.logger.error(f"Failed to update report status in sheets: {e}")
            return False
    
    def get_spreadsheet_url(self) -> Optional[str]:
        """Get the URL of the Google Spreadsheet"""
        if self.spreadsheet:
            return self.spreadsheet.url
        return None


# Create a global instance that will be initialized when Flask app starts
sheets_service = None

def init_sheets_service():
    """Initialize the global sheets service instance"""
    global sheets_service
    sheets_service = GoogleSheetsService()
    return sheets_service

def get_sheets_service():
    """Get the global sheets service instance"""
    global sheets_service
    if sheets_service is None:
        sheets_service = GoogleSheetsService()
    return sheets_service
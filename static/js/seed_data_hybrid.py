from datetime import datetime, date
from models import FAQ, DrugAlert, EducationalContent, User
from extensions import db
from sqlalchemy import inspect, text

def check_column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    try:
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        print(f"Warning: Could not inspect table {table_name}: {e}")
        return False

def get_existing_columns(table_name):
    """Get list of existing columns for a table"""
    try:
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return columns
    except Exception as e:
        print(f"Warning: Could not inspect table {table_name}: {e}")
        return []

def seed_database():
    """Seed the database with initial data (PostgreSQL only - reports go to Google Sheets)"""
    
    # Get existing columns for each table
    faq_columns = get_existing_columns('faq')
    drug_alert_columns = get_existing_columns('drug_alert')
    educational_content_columns = get_existing_columns('educational_content')
    
    print(f"FAQ table columns: {faq_columns}")
    print(f"Drug Alert table columns: {drug_alert_columns}")
    print(f"Educational Content table columns: {educational_content_columns}")
    
    # Seed FAQ data using raw SQL
    faqs = [
        {
            'question_ar': 'ما هي الآثار الجانبية للأدوية؟',
            'question_en': 'What are drug side effects?',
            'question_ku': 'کاریگەرییە لاوەکییەکانی دەرمان چین؟',
            'answer_ar': 'الآثار الجانبية هي تأثيرات غير مرغوب فيها قد تحدث عند استخدام الدواء، وقد تتراوح من خفيفة إلى شديدة.',
            'answer_en': 'Side effects are unwanted effects that may occur when using medication, ranging from mild to severe.',
            'answer_ku': 'کاریگەرییە لاوەکییەکان ئەو کاریگەرییانەن کە نەخوازراون و لە کاتی بەکارهێنانی دەرماندا ڕوودەدەن.',
            'category': 'general'
        },
        {
            'question_ar': 'كيف يمكنني الإبلاغ عن آثار جانبية؟',
            'question_en': 'How can I report side effects?',
            'question_ku': 'چۆن دەتوانم گوزارشت لە کاریگەرییە لاوەکییەکان بدەم؟',
            'answer_ar': 'يمكنك الإبلاغ عن الآثار الجانبية من خلال نموذج التقرير في موقعنا أو الاتصال بالخط الساخن.',
            'answer_en': 'You can report side effects through our website report form or by calling our hotline.',
            'answer_ku': 'دەتوانیت گوزارشت لە کاریگەرییە لاوەکییەکان بدەیت لە ڕێگەی فۆڕمی گوزارشتی ماڵپەڕەکەمانەوە.',
            'category': 'reporting'
        },
        {
            'question_ar': 'ما هي المعلومات المطلوبة للإبلاغ؟',
            'question_en': 'What information is required for reporting?',
            'question_ku': 'چ زانیارییەک پێویستە بۆ گوزارشتدان؟',
            'answer_ar': 'نحتاج إلى معلومات عن المريض، الدواء، الأعراض، وتفاصيل الاتصال بالمبلغ.',
            'answer_en': 'We need information about the patient, medication, symptoms, and reporter contact details.',
            'answer_ku': 'پێویستمان بە زانیاری دەربارەی نەخۆش، دەرمان، نیشانەکان، و وردەکارییەکانی پەیوەندی گوزارشتدەر.',
            'category': 'reporting'
        }
    ]
    
    # Insert FAQs using raw SQL
    for faq_data in faqs:
        try:
            # Build dynamic SQL based on existing columns
            available_data = {k: v for k, v in faq_data.items() if k in faq_columns}
            
            if not available_data or 'question_ar' not in available_data:
                print(f"Warning: Cannot seed FAQ - missing required columns")
                continue
            
            # Check if FAQ already exists using raw SQL
            check_sql = "SELECT COUNT(*) FROM faq WHERE question_ar = :question_ar"
            result = db.session.execute(text(check_sql), {'question_ar': available_data['question_ar']})
            count = result.scalar()
            
            if count == 0:
                # Build INSERT statement dynamically
                columns = list(available_data.keys())
                placeholders = [f":{col}" for col in columns]
                
                # Add optional timestamp columns if they exist
                extra_columns = []
                extra_values = []
                
                if 'is_active' in faq_columns:
                    extra_columns.append('is_active')
                    extra_values.append('true')
                
                if 'created_date' in faq_columns:
                    extra_columns.append('created_date')
                    extra_values.append('CURRENT_TIMESTAMP')
                
                if 'updated_date' in faq_columns:
                    extra_columns.append('updated_date')
                    extra_values.append('CURRENT_TIMESTAMP')
                
                all_columns = columns + extra_columns
                all_values = placeholders + extra_values
                
                insert_sql = f"""
                INSERT INTO faq ({', '.join(all_columns)})
                VALUES ({', '.join(all_values)})
                """
                
                db.session.execute(text(insert_sql), available_data)
                db.session.commit()
                print(f"Seeded FAQ: {available_data['question_ar'][:50]}...")
            else:
                print(f"FAQ already exists: {available_data['question_ar'][:50]}...")
                
        except Exception as e:
            print(f"Warning: Could not seed FAQ '{faq_data.get('question_ar', 'Unknown')}': {e}")
            db.session.rollback()
            continue
    
    # Seed Drug Alert data using raw SQL
    alerts = [
        {
            'title_ar': 'تحذير من دواء ملوث',
            'title_en': 'Warning about contaminated medication',
            'title_ku': 'ئاگاداری لە دەرمانی گڵاو',
            'content_ar': 'تم اكتشاف تلوث في بعض دفعات الدواء. يرجى التوقف عن الاستخدام فوراً.',
            'content_en': 'Contamination has been discovered in some batches of medication. Please stop use immediately.',
            'content_ku': 'گڵاوی لە هەندێک لۆتی دەرماندا دۆزراوەتەوە. تکایە دەستبەجێ بەکارهێنان ڕابگرە.',
            'alert_type': 'warning',
            'severity': 'high',
            'drug_name': 'Paracetamol 500mg',
            'manufacturer': 'ABC Pharma',
            'batch_numbers': 'LOT123, LOT124, LOT125'
        },
        {
            'title_ar': 'سحب دواء من السوق',
            'title_en': 'Drug recall from market',
            'title_ku': 'کشانەوەی دەرمان لە بازاڕ',
            'content_ar': 'تم سحب هذا الدواء من السوق بسبب مشاكل في الجودة.',
            'content_en': 'This medication has been recalled from the market due to quality issues.',
            'content_ku': 'ئەم دەرمانە لە بازاڕ کشاوەتەوە بەهۆی کێشەی کوالیتییەوە.',
            'alert_type': 'recall',
            'severity': 'critical',
            'drug_name': 'Amoxicillin 250mg',
            'manufacturer': 'XYZ Pharmaceuticals',
            'batch_numbers': 'AMX001, AMX002'
        }
    ]
    
    # Insert Drug Alerts using raw SQL
    for alert_data in alerts:
        try:
            # Build dynamic SQL based on existing columns
            available_data = {k: v for k, v in alert_data.items() if k in drug_alert_columns}
            
            if not available_data or 'title_ar' not in available_data:
                print(f"Warning: Cannot seed Drug Alert - missing required columns")
                continue
            
            # Check if alert already exists using raw SQL
            check_sql = "SELECT COUNT(*) FROM drug_alert WHERE title_ar = :title_ar"
            result = db.session.execute(text(check_sql), {'title_ar': available_data['title_ar']})
            count = result.scalar()
            
            if count == 0:
                # Build INSERT statement dynamically
                columns = list(available_data.keys())
                placeholders = [f":{col}" for col in columns]
                
                # Add optional timestamp columns if they exist
                extra_columns = []
                extra_values = []
                
                if 'is_active' in drug_alert_columns:
                    extra_columns.append('is_active')
                    extra_values.append('true')
                
                if 'created_date' in drug_alert_columns:
                    extra_columns.append('created_date')
                    extra_values.append('CURRENT_TIMESTAMP')
                
                if 'updated_date' in drug_alert_columns:
                    extra_columns.append('updated_date')
                    extra_values.append('CURRENT_TIMESTAMP')
                
                all_columns = columns + extra_columns
                all_values = placeholders + extra_values
                
                insert_sql = f"""
                INSERT INTO drug_alert ({', '.join(all_columns)})
                VALUES ({', '.join(all_values)})
                """
                
                db.session.execute(text(insert_sql), available_data)
                db.session.commit()
                print(f"Seeded Drug Alert: {available_data['title_ar'][:50]}...")
            else:
                print(f"Drug Alert already exists: {available_data['title_ar'][:50]}...")
                
        except Exception as e:
            print(f"Warning: Could not seed Drug Alert '{alert_data.get('title_ar', 'Unknown')}': {e}")
            db.session.rollback()
            continue
    
    # Seed Educational Content using raw SQL
    educational_content = [
        {
            'title_ar': 'كيفية استخدام الأدوية بأمان',
            'title_en': 'How to use medications safely',
            'title_ku': 'چۆن دەرمان بە سەلامەتی بەکاربهێنین',
            'content_ar': 'دليل شامل حول الاستخدام الآمن للأدوية وتجنب المخاطر.',
            'content_en': 'A comprehensive guide on safe medication use and avoiding risks.',
            'content_ku': 'ڕێنمایی تەواو دەربارەی بەکارهێنانی سەلامەتی دەرمان و دوورکەوتنەوە لە مەترسییەکان.',
            'category': 'safety',
            'target_audience': 'general_public'
        },
        {
            'title_ar': 'التفاعلات الدوائية',
            'title_en': 'Drug interactions',
            'title_ku': 'کارلێکی دەرمانەکان',
            'content_ar': 'معلومات مهمة حول التفاعلات بين الأدوية المختلفة.',
            'content_en': 'Important information about interactions between different medications.',
            'content_ku': 'زانیاری گرنگ دەربارەی کارلێکی نێوان دەرمانە جیاوازەکان.',
            'category': 'interactions',
            'target_audience': 'healthcare_professionals'
        }
    ]
    
    # Insert Educational Content using raw SQL
    for content_data in educational_content:
        try:
            # Build dynamic SQL based on existing columns
            available_data = {k: v for k, v in content_data.items() if k in educational_content_columns}
            
            if not available_data or 'title_ar' not in available_data:
                print(f"Warning: Cannot seed Educational Content - missing required columns")
                continue
            
            # Check if content already exists using raw SQL
            check_sql = "SELECT COUNT(*) FROM educational_content WHERE title_ar = :title_ar"
            result = db.session.execute(text(check_sql), {'title_ar': available_data['title_ar']})
            count = result.scalar()
            
            if count == 0:
                # Build INSERT statement dynamically
                columns = list(available_data.keys())
                placeholders = [f":{col}" for col in columns]
                
                # Add optional timestamp columns if they exist
                extra_columns = []
                extra_values = []
                
                if 'is_active' in educational_content_columns:
                    extra_columns.append('is_active')
                    extra_values.append('true')
                
                if 'created_date' in educational_content_columns:
                    extra_columns.append('created_date')
                    extra_values.append('CURRENT_TIMESTAMP')
                
                if 'updated_date' in educational_content_columns:
                    extra_columns.append('updated_date')
                    extra_values.append('CURRENT_TIMESTAMP')
                
                all_columns = columns + extra_columns
                all_values = placeholders + extra_values
                
                insert_sql = f"""
                INSERT INTO educational_content ({', '.join(all_columns)})
                VALUES ({', '.join(all_values)})
                """
                
                db.session.execute(text(insert_sql), available_data)
                db.session.commit()
                print(f"Seeded Educational Content: {available_data['title_ar'][:50]}...")
            else:
                print(f"Educational Content already exists: {available_data['title_ar'][:50]}...")
                
        except Exception as e:
            print(f"Warning: Could not seed educational content '{content_data.get('title_ar', 'Unknown')}': {e}")
            db.session.rollback()
            continue
    
    # Final success message
    print("Database seeded successfully with PostgreSQL data!")
    print("Note: Reports will be stored in Google Sheets, not PostgreSQL")

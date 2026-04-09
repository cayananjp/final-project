import re

with open('d:/Documents/FINALS SA LAHAT/FINALS/src/components/UploadRecipe.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Extract and remove CHAR_LIMITS
char_limits_match = re.search(r'    const CHAR_LIMITS = {[\s\S]*?};\n', code)
char_limits_code = char_limits_match.group(0)
code = code.replace(char_limits_code, '')

# 2. Extract and remove TIME_LIMITS
time_limits_match = re.search(r'    const TIME_LIMITS = {[\s\S]*?};\n', code)
time_limits_code = time_limits_match.group(0)
code = code.replace(time_limits_code, '')

# 3. Extract formatTimeDisplay
format_time_match = re.search(r'    const formatTimeDisplay = \(minutes\) => {[\s\S]*?    };\n', code)
format_time_code = format_time_match.group(0)
code = code.replace(format_time_code, '')

# 4. Extract TimeInput
time_input_match = re.search(r'    const TimeInput = \({ label, value[\s\S]*?    };\n', code)
time_input_code = time_input_match.group(0)
code = code.replace(time_input_code, '')

# 5. Extract CharCounter
char_counter_match = re.search(r'    const CharCounter = \(\{ current[\s\S]*?    };\n', code)
char_counter_code = char_counter_match.group(0)
code = code.replace(char_counter_code, '')

# 6. Extract StepComponent
step_component_match = re.search(r'    const StepComponent = \(\{ steps[\s\S]*?    };\n', code)
step_component_code = step_component_match.group(0)
code = code.replace(step_component_code, '')

# Fix indentation of extracted blocks to be top level
def outdent(c):
    return '\n'.join([line[4:] if line.startswith('    ') else line for line in c.split('\n')])

hoisted = outdent(char_limits_code) + '\n' + outdent(time_limits_code) + '\n' + outdent(format_time_code) + '\n' + outdent(char_counter_code) + '\n' + outdent(time_input_code) + '\n' + outdent(step_component_code) + '\n'

# Insert hoisted block before const UploadRecipe = () => {
code = code.replace('const UploadRecipe = () => {', hoisted + '\nconst UploadRecipe = () => {')

with open('d:/Documents/FINALS SA LAHAT/FINALS/src/components/UploadRecipe.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Refactored successfully")

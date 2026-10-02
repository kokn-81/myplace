with open("frontend/src/pages/MapPage.tsx", "r", encoding="utf-8") as f: content = f.read()

import re
# Fix propertyMatchesOperation
content = re.sub(r"if \(\!op \|\| op === .Vender.\) return true;", "if (!op) return true;", content)
content = re.sub(r"if \(op === .Anticrético.\) \{[\s\S]*?\}[\s]*if \(op === .Alquilar.\)", "if (op === \"Alquilar\")", content)

# Fix getOperationIntent
content = re.sub(r"if \(op === .Anticrético.\) return .anticretico.;\n\s*", "", content)

# Fix option === "Anticrético" block
content = re.sub(r"if \(option === .Anticrético.\) \{[\s\S]*?\} else if \(option === .Alquilar.\) \{", "if (option === \"Alquilar\") {", content)

with open("frontend/src/pages/MapPage.tsx", "w", encoding="utf-8") as f: f.write(content)

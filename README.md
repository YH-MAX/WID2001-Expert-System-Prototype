# Reasonova Prototype

Reasonova is a WID2001 expert system prototype for evaluating internship readiness among UM Computer Science students.

## Architecture

- User interface: `static/index.html`, `static/styles.css`, and `static/app.js`
- Knowledge base: IF-THEN rules in `expert_system.py`
- Inference engine: forward-chaining style rule evaluation in `expert_system.py`
- Web server/API: `app.py`

## Run

```powershell
cd E:\WID2001\reasonova_prototype
python -m pip install -r requirements.txt
python app.py
```

Open:

```text
http://127.0.0.1:8000
```

If port 8000 is already busy, run:

```powershell
python app.py 8001
```

Then open:

```text
http://127.0.0.1:8001
```

## Test

```powershell
cd E:\WID2001\reasonova_prototype
python -m unittest
```

## Demo Cases

The UI includes four sample buttons for the recorded demonstration:

- Ideal profile
- High CGPA, no projects
- Project-heavy profile
- Critical gap

## Note

The system uses Experta for the rule runner. A small compatibility patch is included in `expert_system.py` because Experta's pinned `frozendict` dependency still references an older Python collections API.

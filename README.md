# Reasonova Prototype

Reasonova is a WID2001 expert system prototype for evaluating internship readiness among UM Computer Science students.

Live deployment: https://reasonovaprototype.vercel.app/

## Architecture

- User interface: `public/index.html`, `public/styles.css`, and `public/app.js`
- Knowledge base: IF-THEN rules in `expert_system.py`
- Inference engine: forward-chaining style rule evaluation in `expert_system.py`
- Local web server/API: `local_server.py`
- Vercel serverless API: `api/evaluate.py` and `api/rules.py`

## Run

```powershell
cd E:\WID2001\reasonova_prototype
python -m pip install -r requirements.txt
python local_server.py
```

Open:

```text
http://127.0.0.1:8000
```

If port 8000 is already busy, run:

```powershell
python local_server.py 8001
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

## Deploy on Vercel

This repository is ready for Vercel deployment.

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as `Other`.
3. Leave build command and output directory empty.
4. Deploy.

Vercel will serve `public/index.html` and run the Python API routes in `api/`.

## Demo Cases

The UI includes four sample buttons for the recorded demonstration:

- Ideal profile
- High CGPA, no projects
- Project-heavy profile
- Critical gap

## Note

The system uses Experta for the rule runner. A small compatibility patch is included in `expert_system.py` because Experta's pinned `frozendict` dependency still references an older Python collections API.

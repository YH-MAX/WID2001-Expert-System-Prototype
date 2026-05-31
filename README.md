# Reasonova Prototype

Reasonova is a WID2001 expert system prototype for evaluating internship readiness among UM Computer Science students.

Live deployment: https://reasonovaprototype.vercel.app/

## Architecture

- User interface: React dashboard in `frontend/` (build output in `public/`)
- Knowledge base: IF-THEN rules in `expert_system.py`
- Inference engine: forward-chaining style rule evaluation in `expert_system.py`
- Local web server/API: `local_server.py`
- Vercel serverless API: `api/evaluate.py` and `api/rules.py`

## Run the UI (development)

```powershell
cd E:\WID2001\reasonova_prototype\frontend
npm install
npm run dev
```

Open: **http://localhost:5173/**

The UI uses the same scoring and rule logic as `expert_system.py`. When the Python API is running, Vite proxies `/api` requests to it automatically.

## Run the full system (UI + Python API)

Terminal 1 — API and static build:

```powershell
cd E:\WID2001\reasonova_prototype
python -m pip install -r requirements.txt
cd frontend
npm install
npm run build
cd ..
python local_server.py
```

Open: **http://127.0.0.1:8001**

If port 8001 is busy, pass another port:

```powershell
python local_server.py 8080
```

## Build UI for deployment

```powershell
cd E:\WID2001\reasonova_prototype\frontend
npm run build
```

This writes the production React build to `public/` for Vercel and `local_server.py`.

## Test

```powershell
cd E:\WID2001\reasonova_prototype
python -m unittest
```

## Deploy on Vercel

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as `Other`.
3. Set build command: `cd frontend && npm install && npm run build`
4. Leave output directory as `public` (default static root).
5. Deploy.

Vercel will serve the React UI from `public/` and run the Python API routes in `api/`.

## Demo Cases

The UI includes four sample buttons for the recorded demonstration:

- Ideal profile
- High CGPA, no projects
- Project-heavy profile
- Critical gap

## Note

The system uses Experta for the rule runner. A small compatibility patch is included in `expert_system.py` because Experta's pinned `frozendict` dependency still references an older Python collections API.

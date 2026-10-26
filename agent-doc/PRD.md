TO FIX 

-  Does history load old (before-install) calls? — YES  , Fix that, only take history after install, before history no need.
- In the batch import loop of history, after computing entryCallKey, skip if the key is already in insertable keys, and add every accepted key to the set before continuing.
- Download should download CSV with : Number, status , Interested, Do not call , Notes, called date (DD/MM), called time(HH:MM)
- In the My stats, Right hand side of "Last 30 days" in mobile show the office hourse like this "10:00 to 7:00" or whatever office time.
- In the calls table in server, what is need of "Ourcome" and "User" Column. 



This error in the server - 



File "/opt/render/project/src/.venv/bin/gunicorn", line 6, in &lt;module&gt;  
    sys.exit(run())  
             \~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/app/[wsgiapp.py](http://wsgiapp.py)", line 66, in run  
    WSGIApplication("%(prog)s \[OPTIONS\] \[APP\_MODULE\]", prog=prog).run()  
    \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/app/[base.py](http://base.py)", line 235, in run  
    super().run()  
    \~\~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/app/[base.py](http://base.py)", line 71, in run  
    Arbiter(self).run()  
    \~\~\~\~\~\~\~^^^^^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/[arbiter.py](http://arbiter.py)", line 63, in **init**  
    self.setup(app)  
    \~\~\~\~\~\~\~\~\~\~^^^^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/[arbiter.py](http://arbiter.py)", line 164, in setup  
    [self.app](http://self.app).wsgi()  
    \~\~\~\~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/app/[base.py](http://base.py)", line 66, in wsgi  
    self.callable = self.load()  
                    \~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/app/[wsgiapp.py](http://wsgiapp.py)", line 57, in load  
    return self.load\_wsgiapp()  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/app/[wsgiapp.py](http://wsgiapp.py)", line 47, in load\_wsgiapp  
    return util.import\_app([self.app](http://self.app)\_uri)  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^^^^^^^^^^^^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/gunicorn/[util.py](http://util.py)", line 420, in import\_app  
    mod = importlib.import\_module(module)  
  File "/opt/render/project/python/Python-3.14.8/lib/python3.14/importlib/\_\_init\_\_.py", line 88, in import\_module  
    return *bootstrap.*gcd\_import(name\[level:\], package, level)  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
  File "&lt;frozen importlib.\_bootstrap&gt;", line 1406, in *gcd*import  
  File "&lt;frozen importlib.\_bootstrap&gt;", line 1371, in *find*and\_load  
  File "&lt;frozen importlib.\_bootstrap&gt;", line 1342, in *find*and\_load\_unlocked  
  File "&lt;frozen importlib.\_bootstrap&gt;", line 938, in *load*unlocked  
  File "&lt;frozen importlib.\_bootstrap\_external&gt;", line 763, in exec\_module  
  File "&lt;frozen importlib.\_bootstrap&gt;", line 491, in *call*with\_frames\_removed  
  File "/opt/render/project/src/backend/[wsgi.py](http://wsgi.py)", line 12, in &lt;module&gt;  
    app: Flask = create\_app()  
                 \~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/backend/app/\_\_init\_\_.py", line 102, in create\_app  
    create\_initial\_manager(app)  
    \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^^^^  
  File "/opt/render/project/src/backend/app/\_\_init\_\_.py", line 33, in create\_initial\_manager  
    existing\_manager: User | None = User.query.filter\_by(name=manager\_name).first()  
                                    \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/orm/[query.py](http://query.py)", line 2823, in first  
    return self.limit(1).\_iter().first()  # type: ignore\[return-value\]  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/orm/[query.py](http://query.py)", line 2921, in *iter*  
    *result: Union\[ScalarResult\[*T\], Result\[\_T\]\] = self.session.execute(  
                                                  \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        statement,  
        ^^^^^^^^^^  
        params,  
        ^^^^^^^  
        execution\_options={"\_sa\_orm\_load\_options": self.load\_options},  
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/orm/[session.py](http://session.py)", line 2473, in execute  
    return self.\_execute\_internal(  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        statement,  
        ^^^^^^^^^^  
    ...&lt;4 lines&gt;...  
        *add*event=\_add\_event,  
        ^^^^^^^^^^^^^^^^^^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/orm/[session.py](http://session.py)", line 2363, in *execute*internal  
    compile\_state\_cls.orm\_execute\_statement(  
    \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        self,  
        ^^^^^  
    ...&lt;4 lines&gt;...  
        conn,  
        ^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/orm/[context.py](http://context.py)", line 316, in orm\_execute\_statement  
    result = conn.execute(  
        statement, params or {}, execution\_options=execution\_options  
    )  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[base.py](http://base.py)", line 1451, in execute  
    return meth(  
        self,  
        distilled\_parameters,  
        execution\_options or NO\_OPTIONS,  
    )  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/sql/[elements.py](http://elements.py)", line 533, in *execute*on\_connection  
    return connection.\_execute\_clauseelement(  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        self, distilled\_params, execution\_options  
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[base.py](http://base.py)", line 1671, in *execute*clauseelement  
    ret = self.\_execute\_context(  
        dialect,  
    ...&lt;9 lines&gt;...  
        param\_dict=param\_dict,  
    )  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[base.py](http://base.py)", line 1825, in *execute*context  
    return self.\_exec\_single\_context(  
           \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        dialect, context, statement, parameters  
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[base.py](http://base.py)", line 1965, in *exec*single\_context  
    self.\_handle\_dbapi\_exception(  
    \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        e, str\_statement, effective\_parameters, cursor, context  
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[base.py](http://base.py)", line 2335, in *handle*dbapi\_exception  
    raise sqlalchemy\_exception.with\_traceback(exc\_info\[2\]) from e  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[base.py](http://base.py)", line 1946, in *exec*single\_context  
    [self.dialect.do](http://self.dialect.do)\_execute(  
    \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^  
        cursor, str\_statement, effective\_parameters, context  
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
    )  
    ^  
  File "/opt/render/project/src/.venv/lib/python3.14/site-packages/sqlalchemy/engine/[default.py](http://default.py)", line 1192, in do\_execute  
    cursor.execute(statement, parameters)  
    \~\~\~\~\~\~\~\~\~\~\~\~\~\~^^^^^^^^^^^^^^^^^^^^^^^  
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) column users.auth\_token does not exist  
LINE 1: ... users\_is\_active, [users.country](http://users.country) AS users\_country, users.auth...  
                                                             ^  
  
\[SQL: SELECT [users.id](http://users.id) AS users\_id, [users.name](http://users.name) AS users\_name, users.password\_hash AS users\_password\_hash, users.role AS users\_role, [users.is](http://users.is)\_active AS users\_is\_active, [users.country](http://users.country) AS users\_country, users.auth\_token AS users\_auth\_token, users.created\_at AS users\_created\_at   
FROM users   
WHERE [users.name](http://users.name) = %(name\_1)s   
 LIMIT %(param\_1)s\]  
\[parameters: {'name\_1': 'CurosAI-Admin', 'param\_1': 1}\]  
(Background on this error at: [https://sqlalche.me/e/21/f405](https://sqlalche.me/e/21/f405))
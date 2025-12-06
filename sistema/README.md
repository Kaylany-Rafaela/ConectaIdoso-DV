
----------
# 🫂 Projeto ConectaIdoso

O Projeto ConectaIdoso é uma plataforma que visa auxiliar idosos e seus familiares no acompanhamento de atividades, acesso a conteúdos educativos e comunicação, de forma acessível e intuitiva. Antes de iniciar, é necessário ter instalado o Java JDK 11 ou superior, Maven e PostgreSQL.

Para rodar o projeto, crie um novo banco de dados no seu servidor PostgreSQL com o nome conecta_idoso, localize o arquivo application.properties em src/main/resources e atualize as informações de conexão conforme o seu ambiente:

spring.datasource.url=jdbc:postgresql://localhost:5432/conecta_idoso  
spring.datasource.username=postgres  
spring.datasource.password=0000

Lembre-se de ajustar o username e password conforme sua configuração local no PgAdmin.

Depois disso, abra o terminal dentro da pasta do projeto e execute os seguintes comandos:

mvn compile  
mvn package  
mvn spring-boot:run

Após iniciar o servidor, acesse o sistema pelo navegador em:  
[http://localhost:8080/login.html]
(http://localhost:8080/login.html)

No frontend foram implementadas as seguintes funcionalidades: o botão de sair agora encerra a sessão do usuário, em vez de apenas redirecionar para o login; o botão de cadastrar envia uma requisição ao backend para salvar o usuário no banco de dados; o botão de login faz uma requisição ao backend para verificar se o usuário existe e se a senha está correta; e foi criado um script de verificação de sessão, garantindo que apenas usuários logados possam acessar as outras páginas. Caso contrário, o sistema redireciona automaticamente para a tela de login.


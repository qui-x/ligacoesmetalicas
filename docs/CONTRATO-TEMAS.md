# Contrato de Temas

O registro domain/silm/themes.js contém id, version, title, subtitle, description, concepts, resources, relatedMissions, relatedRoutes, relatedMetals e sources. O validador rejeita IDs duplicados, conceitos vazios, fontes inexistentes e referências inválidas. Cada missão declara temas existentes e cada hub referencia missões/roteiros reais.

A persistência learning.themes usa {schemaVersion:1, completed:{themeId:version}}. Somente IDs e versões atuais são aceitos; campos extras não são copiados. Todos os temas podem ser lidos em qualquer ordem. O conteúdo usa texto seguro, links locais e o registro central de fontes. Links externos de referência não são necessários para uso offline.

A interface antiga deixa de ser uma aplicação paralela: completo.html encaminha à entrada principal, com adaptação de caminhos antigos de laboratório/manual. Os marcadores e a sessão científica anterior são preservados nas migrações compatíveis.

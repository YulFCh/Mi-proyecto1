FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore ApiProyecto1/ApiProyecto1/ApiProyecto1.csproj
RUN dotnet publish ApiProyecto1/ApiProyecto1/ApiProyecto1.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app .

EXPOSE 8080

ENTRYPOINT ["dotnet", "ApiProyecto1.dll"]
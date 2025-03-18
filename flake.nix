{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    let
      mkDevShell = system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.prettier
            nodePackages.pnpm
          ];

          shellHook = ''
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
          '';
        };
    in
    (flake-utils.lib.eachDefaultSystem (system: {
      devShells.default = mkDevShell system;
    })) // {
      devShells.aarch64-darwin.default = mkDevShell "aarch64-darwin";
      devShells.x86_64-darwin.default = mkDevShell "x86_64-darwin";
      devShells.aarch64-linux.default = mkDevShell "aarch64-linux";
      devShells.x86_64-linux.default = mkDevShell "x86_64-linux";
    };
}